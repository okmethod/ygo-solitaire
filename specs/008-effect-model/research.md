# Effect Model Implementation - Research & Technical Decisions

**Date**: 2025-01-28  
**Status**: Complete  
**Related**: [plan.md](./plan.md), [ADR-0008](../../docs/adr/0008-effect-model-and-clean-architecture.md)

---

## 1. ChainableAction と CardEffect の共存戦略

**Decision**: ChainableActionRegistry を優先し、CardEffectRegistry はフォールバックとして使用

**Rationale**:
- 新システム（ChainableAction）が登録されていれば、それを優先使用
- 未移行のカードは既存システム（CardEffect）で動作
- 段階的移行が可能で、リスクが低い

**Implementation**:

```typescript
// ActivateSpellCommand.execute() 内
const cardId = cardInstance.id;

// 1. ChainableActionRegistry を優先チェック
const chainableAction = ChainableActionRegistry.get(cardId);
if (chainableAction && chainableAction.canActivate(stateAfterActivation)) {
  // 新システムで処理
  const activationSteps = chainableAction.createActivationSteps(stateAfterActivation);
  // ... activation steps を即座に実行
  
  const resolutionSteps = chainableAction.createResolutionSteps(currentState, this.cardInstanceId);
  return {
    success: true,
    newState: currentState,
    effectSteps: resolutionSteps, // Application層に委譲
  };
}

// 2. CardEffectRegistry にフォールバック（既存システム）
const effect = CardEffectRegistry.get(cardId);
if (effect && effect.canActivate(stateAfterActivation)) {
  // 旧システムで処理（Phase 5まで維持）
  const steps = effect.createSteps(stateAfterActivation, this.cardInstanceId);
  this.effectResolutionService.startResolution(steps);
  return createSuccessResult(stateAfterActivation);
}

// 3. どちらにも登録されていない → 効果なし
const zonesAfterResolution = sendToGraveyard(zonesAfterActivation, this.cardInstanceId);
// ...
```

**Alternatives Considered**:
- ❌ **両方のregistryを同時チェックし、エラーを出す**: 移行期間中に不便
- ❌ **CardEffectを即座に削除**: 既存機能が壊れるリスク大

**Migration Completion Criteria**:
- [ ] Pot of Greed が ChainableActionRegistry に登録済み
- [ ] Graceful Charity が ChainableActionRegistry に登録済み
- [ ] 上記2カードのすべてのテストがパス
- [ ] CardEffectRegistry.get() の呼び出しがゼロ（grep検索で確認）

---

## 2. effectSteps の型安全性と非同期処理

**Decision**: actionシグネチャを同期関数に統一（非同期処理を削除）

**Rationale**:
- 現在のEffectResolutionStepは `Promise<GameStateUpdateResult> | GameStateUpdateResult` を許容
- しかし、実際のユースケースでは非同期処理は不要（すべてのDomain操作は同期的）
- 型を統一することで、型安全性が向上し、コードが読みやすくなる

**New Type Definition**:

```typescript
// domain/effects/EffectResolutionStep.ts
export interface EffectResolutionStep {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  
  /**
   * 効果処理の実行関数（同期）
   * @param state - 現在のゲーム状態
   * @param selectedInstanceIds - カード選択が必要な場合の選択カードID配列
   * @returns ゲーム状態更新結果
   */
  action: (state: GameState, selectedInstanceIds?: string[]) => GameStateUpdateResult;
  
  readonly cardSelectionConfig?: {
    readonly minCards: number;
    readonly maxCards: number;
    readonly title: string;
    readonly message: string;
  };
}
```

**Migration Notes**:
- 既存の `await` キーワードを削除（effectResolutionStore.confirmCurrentStep内）
- PotOfGreedEffect, GracefulCharityEffectのactionから `async` を削除

**Alternatives Considered**:
- ❌ **非同期を維持**: 将来の拡張性を考慮したが、YAGNIの原則により却下
- ❌ **オーバーロード**: 型が複雑になり、エラーハンドリングが困難

---

## 3. AdditionalRule の apply/checkPermission/replace の使い分け

**Decision**: チキンレースのダメージ無効化は `checkPermission()` で実装

**Rationale**:
- ダメージ無効化は「ダメージを受けるか？」の判定（Permission check）
- データを直接書き換えるのではなく、処理の可否を判定する
- `category: "ActionPermission"` と組み合わせる

**Implementation**:

```typescript
// domain/effects/additional/ChickenGameContinuousRule.ts
export class ChickenGameContinuousRule implements AdditionalRule {
  readonly isEffect = true; // 永続効果なので無効化可能
  readonly category: RuleCategory = "ActionPermission";

  canApply(state: GameState, context: RuleContext): boolean {
    // チキンレースがフィールドに存在するか
    const chickenGameOnField = state.zones.field.some(
      card => card.id === 67616300 && card.position === "faceUp"
    );
    if (!chickenGameOnField) return false;

    // ダメージを受けるプレイヤーのLPが相手より少ないか
    const damageTarget = context.damageTarget || "player";
    if (damageTarget === "player") {
      return state.lp.player < state.lp.opponent;
    } else {
      return state.lp.opponent < state.lp.player;
    }
  }

  checkPermission(state: GameState, context: RuleContext): boolean {
    // ダメージを受けることを禁止（false = 禁止）
    // この場合、ダメージ処理側で checkPermission が false なら damage = 0 にする
    return false; // ダメージ禁止
  }
}
```

**使い分けガイドライン**:

| メソッド | 用途 | 戻り値 | 例 |
|---------|------|-------|---|
| `apply()` | データ書き換え | GameState | 攻撃力+1000、カード名を「青眼の白龍」に変更 |
| `checkPermission()` | 行動の可否判定 | boolean | 攻撃できない、効果発動できない、ダメージ無効化 |
| `replace()` | 処理の置換 | GameState | 破壊される代わりに除外、墓地に行く代わりにデッキに戻る |

**Alternatives Considered**:
- ❌ **apply()で実装**: ダメージ値を0にする処理は「判定」ではなく「書き換え」だが、ダメージ処理が複雑化する
- ❌ **replace()で実装**: 処理置換は過剰な抽象化

---

## 4. チキンレースの「1ターンに1度」制限の実装方法

**Decision**: GameStateに `activatedIgnitionEffectsThisTurn` フィールドを追加

**Rationale**:
- 起動効果の発動履歴を記録する専用フィールド
- Set<string> で管理（カードインスタンスID + 効果ID）
- ターン終了時（AdvancePhaseCommand）でクリア
- 既存の `actionHistory` は使用しない（別の目的で使用される可能性）

**GameState 拡張**:

```typescript
// domain/models/GameState.ts
export interface GameState {
  // ... 既存フィールド
  
  /**
   * 今ターン発動済みの起動効果（1ターンに1度制限用）
   * Format: `${cardInstanceId}:${effectId}`
   */
  readonly activatedIgnitionEffectsThisTurn: ReadonlySet<string>;
}
```

**実装例**:

```typescript
// ChickenGameIgnitionEffect.canActivate()
canActivate(state: GameState): boolean {
  // 基本条件チェック（フェーズ、LPコスト等）
  if (state.phase !== "Main1") return false;
  if (state.lp.player < 1000) return false;

  // 1ターンに1度制限チェック
  const effectKey = `${this.cardInstanceId}:chicken-game-ignition`;
  if (state.activatedIgnitionEffectsThisTurn.has(effectKey)) {
    return false; // 既に発動済み
  }

  return true;
}

// ActivateSpellCommand または GameFacade での発動記録
const newState = {
  ...result.newState,
  activatedIgnitionEffectsThisTurn: new Set([
    ...result.newState.activatedIgnitionEffectsThisTurn,
    effectKey,
  ]),
};
```

**AdvancePhaseCommand でのクリア**:

```typescript
// AdvancePhaseCommand.execute()
const newState: GameState = {
  ...state,
  phase: nextPhase,
  turn: nextTurn,
  activatedIgnitionEffectsThisTurn: new Set(), // ターン終了時にクリア
};
```

**Alternatives Considered**:
- ❌ **actionHistory を活用**: 別の目的で使用される可能性があり、責務が混在
- ❌ **カード側で状態を持つ**: GameStateがイミュータブルなため不適切

---

## 5. テスト戦略: 既存テストの保守と新規テストの追加

**Decision**: 既存テストを修正し、新規テストを追加。移行期間中は両方のシステムをテスト

**Rationale**:
- 既存の ActivateSpellCommand.test.ts を修正（DI削除、effectSteps検証追加）
- ChainableAction/AdditionalRuleの単体テストを新規追加
- 統合テスト（NormalSpells.test.ts）で新旧システム両方を検証
- カバレッジ目標: 90%以上（既存と同等）

**Test File Structure**:

```
tests/
├── unit/
│   └── domain/
│       ├── models/
│       │   ├── ChainableAction.test.ts          # 新規: インターフェース仕様テスト
│       │   └── AdditionalRule.test.ts           # 新規: インターフェース仕様テスト
│       │
│       ├── registries/
│       │   ├── ChainableActionRegistry.test.ts  # 新規: Registry Pattern検証
│       │   └── AdditionalRuleRegistry.test.ts   # 新規: カテゴリフィルタ等
│       │
│       ├── effects/
│       │   ├── chainable/
│       │   │   ├── PotOfGreedAction.test.ts     # 新規: 新システムでの実装
│       │   │   ├── GracefulCharityAction.test.ts # 新規
│       │   │   └── ChickenGameActions.test.ts   # 新規: 3種類の効果
│       │   │
│       │   └── additional/
│       │       └── ChickenGameContinuousRule.test.ts # 新規: ダメージ無効化
│       │
│       └── commands/
│           └── ActivateSpellCommand.test.ts     # 修正: DI削除、effectSteps検証
│
└── integration/
    └── card-effects/
        ├── NormalSpells.test.ts                 # 修正: 新旧両方をテスト
        └── ChickenGame.test.ts                  # 新規: E2Eテスト
```

**ActivateSpellCommand.test.ts の修正内容**:

Before (Phase 2まで):
```typescript
const effectResolutionService = new EffectResolutionServiceImpl();
const command = new ActivateSpellCommand(cardInstanceId, effectResolutionService);
```

After (Phase 3以降):
```typescript
// DI不要
const command = new ActivateSpellCommand(cardInstanceId);

// effectStepsを検証
const result = command.execute(initialState);
expect(result.success).toBe(true);
expect(result.effectSteps).toBeDefined();
expect(result.effectSteps?.length).toBeGreaterThan(0);
```

**新規テストのポイント**:
- **ChainableAction単体テスト**: canActivate, createActivationSteps, createResolutionStepsを個別に検証
- **AdditionalRule単体テスト**: canApply, checkPermission, apply, replaceを個別に検証
- **Registry単体テスト**: register, get, getByCategory, collectActiveRulesを検証
- **統合テスト**: GameFacade経由での完全な効果解決フロー

**テストカバレッジ目標**:
- Domain Layer: 90%以上（既存と同等）
- ChainableAction/AdditionalRule: 100%（新規モデルは完全カバー）
- Registry: 100%（単純なロジックなので完全カバー可能）

**Alternatives Considered**:
- ❌ **既存テストを削除し、新規テストのみ**: 移行期間中のリスク大
- ❌ **E2Eテストのみ**: 単体テストがないと、バグの特定が困難

---

## Summary

すべての技術的不明点を解決しました。以下の決定事項をPhase 1のデータモデル設計とPhase 2以降の実装に反映します。

**Key Decisions**:
1. **共存戦略**: ChainableActionRegistryを優先、CardEffectRegistryにフォールバック
2. **型安全性**: actionシグネチャを同期関数に統一
3. **ダメージ無効化**: checkPermission()で実装（ActionPermissionカテゴリ）
4. **1ターンに1度**: activatedIgnitionEffectsThisTurnフィールドを追加
5. **テスト戦略**: 既存テスト修正 + 新規テスト追加、カバレッジ90%以上

**Next Steps**:
- Phase 1: data-model.md作成（上記の決定事項を反映）
- contracts/生成
- quickstart.md作成
