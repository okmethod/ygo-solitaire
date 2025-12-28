# ADR-0008: 効果モデルの導入と Clean Architecture の完全実現

## Status

✅ Accepted (2025-01-28)

## Context

現在の効果システム（ADR-0005, ADR-0007）には、以下の課題が残っています：

### 1. 効果の体系化が不完全

現在は「魔法カードの発動」のみを `CardEffect` として実装していますが、遊戯王OCGの効果は以下のように多様です：

- **チェーンブロックを作る処理**:
  - カードの発動（魔法・罠カードを表にして出す処理）
  - 効果の発動（起動効果、誘発効果、クイックエフェクト）

- **追加ルール**:
  - 永続効果（フィールドに存在する限り適用）
  - 分類されない効果/ルール効果（手札・墓地でも適用）
  - 効果外テキスト（無効化されないルール）

現在の `CardEffect` は「通常魔法カードの発動」のみをカバーしており、体系的な効果モデルが不足しています。

### 2. Clean Architecture 違反が残存

ADR-0007 の Post-Implementation Issue ([docs/adr/0007-domain-layer-refactoring.md:280-357](../adr/0007-domain-layer-refactoring.md#L280-L357)) で指摘された通り、`ActivateSpellCommand` が Application Layer の `effectResolutionStore` に依存している問題が残っています。

```typescript
// ❌ 現状: Domain層がApplication層に依存
// ActivateSpellCommand.ts (Domain層)
export class ActivateSpellCommand implements GameCommand {
  constructor(
    private readonly cardInstanceId: string,
    private readonly effectResolutionService: IEffectResolutionService, // ← DI
  ) {}

  execute(state: GameState): GameStateUpdateResult {
    const steps = effect.createSteps(state);
    this.effectResolutionService.startResolution(steps); // ← Application層の制御フロー
    return { success: true, newState };
  }
}
```

現在の `IEffectResolutionService` は **形式的な依存関係ルール違反の解消** にすぎず、以下の問題があります：

- **責務の混在**: Domain Layer が「効果解決の開始」という Application Layer の責務を持っている
- **テスタビリティの低下**: DI が必要なため、テストコードが複雑化
- **設計の不自然さ**: Domain Layer がフローの制御を行っている

### 3. 公式ルールとの乖離

遊戯王OCG公式ルールでは、効果は以下の3つの構成要素に分離されます（参考: [Conditions, Activations, and Effects](https://www.yugioh-card.com/eu/play/understanding-card-text/part-3-conditions-activations-and-effects/)）：

- **CONDITIONS**: 発動条件
- **ACTIVATION**: 発動時の処理（コスト支払い、対象指定等）
- **RESOLUTION**: 効果の解決

現在の `CardEffect.createSteps()` は、これらを区別せずに単一のステップ配列として返すため、公式ルールとの対応が不明瞭です。

## Decision

以下の3つのリファクタリングを実施し、効果システムを体系化すると同時に、Clean Architecture を完全に実現します：

### 1. 効果モデルの導入

遊戯王OCGの公式ルールに基づき、効果を **ChainableAction** と **AdditionalRule** の2つのモデルに分離します。

#### A. ChainableAction: チェーンブロックを作る処理

「カードの発動」と「効果の発動」を統一的に扱うモデルです。

```typescript
// domain/models/ChainableAction.ts
export interface ChainableAction {
  /** カードの発動か効果の発動か */
  isCardActivation: boolean;

  /** スペルスピード (1, 2, 3) */
  spellSpeed: 1 | 2 | 3;

  /** 発動条件チェック (CONDITIONS) */
  canActivate(state: GameState): boolean;

  /** アクティベーション時の処理ステップ生成 (ACTIVATION) */
  createActivationSteps(state: GameState): EffectResolutionStep[];

  /** 効果解決時の処理ステップ生成 (RESOLUTION) */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
}
```

**公式ルールとの対応**:
- `canActivate()` → CONDITIONS（発動条件）
- `createActivationSteps()` → ACTIVATION（発動時の処理）
- `createResolutionSteps()` → RESOLUTION（効果の解決）

**既存の CardEffect との関係**:
- 現在の `CardEffect` を `ChainableAction` の具象実装として再構成
- `CardEffect.createSteps()` を `createActivationSteps()` と `createResolutionSteps()` に分離

#### B. AdditionalRule: 追加ルール

基本的なルールに追加・オーバーライドする形で適用する、個別のルールのような効果です。

```typescript
// domain/models/AdditionalRule.ts
export interface AdditionalRule {
  /** ルール上「効果」にあたるか */
  isEffect: boolean;

  /** ルールのカテゴリ */
  category: RuleCategory;

  /** 適用条件チェック */
  canApply(state: GameState, context: RuleContext): boolean;

  /** データ書き換え系 (Name Override, Status Modifier) */
  apply?(state: GameState, context: RuleContext): GameState;

  /** 判定追加・制限系 (Summon Condition, Permission, Victory Condition) */
  checkPermission?(state: GameState, context: RuleContext): boolean;

  /** 処理置換・フック系 (Action Replacement, Self Destruction) */
  replace?(state: GameState, context: RuleContext): GameState;
}

export type RuleCategory =
  // データ書き換え
  | "NameOverride"
  | "StatusModifier"
  // 判定追加・制限追加
  | "SummonCondition"
  | "SummonPermission"
  | "ActionPermission"
  | "VictoryCondition"
  // 処理置換・処理フック
  | "ActionReplacement"
  | "SelfDestruction";
```

**ルールカテゴリの分類**:
- **データ書き換え**: カード名、攻撃力/守備力の変更
- **判定追加・制限追加**: 召喚条件、行動制限、特殊勝利判定
- **処理置換・処理フック**: 破壊耐性、身代わり効果、維持コスト

### 2. Registry Pattern の拡張

効果モデルに対応する Registry を追加します。

```typescript
// domain/registries/ChainableActionRegistry.ts
export class ChainableActionRegistry {
  private static actions = new Map<number, ChainableAction>();

  static register(cardId: number, action: ChainableAction): void;
  static get(cardId: number): ChainableAction | undefined;
  static clear(): void;
}

// domain/registries/AdditionalRuleRegistry.ts
export class AdditionalRuleRegistry {
  // 1枚のカードに複数のルールを登録可能
  private static rules = new Map<number, AdditionalRule[]>();

  static register(cardId: number, rule: AdditionalRule): void;
  static get(cardId: number): AdditionalRule[];

  // カテゴリ別フィルタ
  static getByCategory(cardId: number, category: RuleCategory): AdditionalRule[];

  // フィールド全体から適用可能なルールを収集
  static collectActiveRules(state: GameState, category: RuleCategory, context?: RuleContext): AdditionalRule[];

  static clear(): void;
}
```

**Registry の責務分離**:

| Registry | 責務 | Key | Value | パターン |
|----------|------|-----|-------|----------|
| CardDataRegistry | カード基本データ | Card ID | CardData | 関数ベース (既存) |
| ChainableActionRegistry | チェーン可能な処理 | Card ID | ChainableAction | クラスベース |
| AdditionalRuleRegistry | 追加ルール | Card ID | AdditionalRule[] | クラスベース + カテゴリフィルタ |

### 3. Clean Architecture の完全実現

Domain Layer が Application Layer に依存している問題を根本的に解決します。

#### 問題の本質

現在の `ActivateSpellCommand` は以下の2つの責務を持っています：

1. **ドメインロジック**: 効果の発動条件チェック、効果ステップの生成
2. **フロー制御**: 効果解決の開始（`effectResolutionService.startResolution()`）

**2番目の責務は Application Layer のものです。**

#### 解決策: 効果ステップを「返す」設計

Domain Layer は効果ステップを返すだけにし、Application Layer が効果解決フローを制御します。

```typescript
// ✅ 提案: GameStateUpdateResult に effectSteps フィールドを追加
// domain/models/GameStateUpdateResult.ts
export interface GameStateUpdateResult {
  success: boolean;
  newState: GameState;
  message?: string;

  // 新規追加: 効果解決ステップ (オプショナル)
  effectSteps?: EffectResolutionStep[];
}

// ✅ 提案: Domain層は効果ステップを返すだけ
// domain/commands/ActivateSpellCommand.ts
export class ActivateSpellCommand implements GameCommand {
  constructor(private readonly cardInstanceId: string) {}

  execute(state: GameState): GameStateUpdateResult {
    const effect = ChainableActionRegistry.get(cardId);

    if (!effect || !effect.canActivate(state)) {
      return createFailureResult(state, "Cannot activate effect");
    }

    // アクティベーションステップを実行（即座に実行）
    const activationSteps = effect.createActivationSteps(state);
    let currentState = state;
    for (const step of activationSteps) {
      const result = step.action(currentState);
      if (!result.success) return result;
      currentState = result.newState;
    }

    // 効果解決ステップを返すだけ（実行しない）
    const resolutionSteps = effect.createResolutionSteps(currentState, this.cardInstanceId);

    return {
      success: true,
      newState: currentState,
      effectSteps: resolutionSteps, // ← Application層に委譲
    };
  }
}

// ✅ 提案: Application層が効果解決フローを制御
// application/GameFacade.ts
export class GameFacade {
  activateSpell(cardInstanceId: string): void {
    const command = new ActivateSpellCommand(cardInstanceId);
    const result = command.execute(get(gameStateStore));

    if (!result.success) {
      // エラーハンドリング
      return;
    }

    // GameStateを更新
    gameStateStore.set(result.newState);

    // 効果解決フローを制御（Application層の責務）
    if (result.effectSteps && result.effectSteps.length > 0) {
      effectResolutionStore.startResolution(result.effectSteps);
    }
  }
}
```

**IEffectResolutionService の削除**:
- Domain Layer が Application Layer の制御フローを呼ばない
- DI が不要になる
- GameFacade が直接 `effectResolutionStore` を使う

## Consequences

### Positive

✅ **効果の体系化**
- 遊戯王OCGの公式ルールに準拠した効果モデル
- ChainableAction と AdditionalRule の責務分離が明確
- 将来的なカード追加が容易（Open/Closed Principle）

✅ **Clean Architecture の完全実現**
- Domain Layer が Application Layer に依存しない
- 各層の責務が明確: Domain = ロジック、Application = フロー制御
- DI 不要によるテストの簡略化

✅ **公式ルールとの対応が明確**
- CONDITIONS / ACTIVATION / RESOLUTION の3ステップ構成
- チェーンシステムの実装が容易
- ドキュメントとコードの一貫性向上

✅ **拡張性の向上**
- AdditionalRuleRegistry の collectActiveRules でフィールド全体のルールを一括取得
- カテゴリ別フィルタで効率的なルール適用
- 1枚のカードに複数のルールを登録可能

✅ **保守性の向上**
- 効果処理が `effects/chainable/` と `effects/additional/` に明確に分離
- Registry Pattern による O(1) 高速ルックアップ
- テストファイルも同様に分離可能

### Negative

❌ **大規模リファクタリングの工数**
- 既存の `CardEffect` を `ChainableAction` に移行
- `ActivateSpellCommand` の大幅な変更
- 既存テストの修正が必要

❌ **一時的な学習コスト**
- ChainableAction と AdditionalRule の使い分け
- Registry Pattern の拡張
- effectSteps の取り扱い

### Neutral

⚖️ **既存の CardEffectRegistry との共存期間**
- 移行期間中は `CardEffectRegistry` と `ChainableActionRegistry` が共存
- 段階的な移行が可能だが、一貫性の維持に注意が必要

## Alternatives Considered

### Alternative 1: IEffectResolutionService を維持

```typescript
// 現状維持（DI継続）
constructor(
  private readonly cardInstanceId: string,
  private readonly effectResolutionService: IEffectResolutionService,
) {}
```

- **却下理由**:
  - 形式的な依存関係ルール違反の解消にすぎない
  - Domain Layer がフロー制御を行う設計の不自然さが残る
  - テストコードが複雑化（モック必要）

### Alternative 2: ChainableAction と AdditionalRule を統合

```typescript
// 単一の Effect インターフェース
export interface Effect {
  type: "chainable" | "additional";
  // ...
}
```

- **却下理由**:
  - 責務が混在（Single Responsibility Principle 違反）
  - チェーンブロックを作る処理と追加ルールは性質が異なる
  - Registry の実装が複雑化（カテゴリフィルタ等）

### Alternative 3: createActivationSteps と createResolutionSteps を統合

```typescript
// 現状の createSteps を維持
createSteps(state: GameState): EffectResolutionStep[];
```

- **却下理由**:
  - 公式ルールの ACTIVATION と RESOLUTION の区別が不明瞭
  - チェーンシステムの実装が困難（解決タイミングの制御）
  - アクティベーションステップ（即座に実行）と解決ステップ（チェーン解決時に実行）の違いが表現できない

## Implementation Plan

この設計変更は段階的に実装する必要があります。詳細な実装手順は `/speckit.specify` で定義されます。

### 高レベルフェーズ（参考）

1. **モデル定義とRegistry実装** - 新しい効果モデルの基盤を整備
2. **ChainableActionへの移行** - 既存 CardEffect を ChainableAction として再実装
3. **ActivateSpellCommandのリファクタリング** - effectSteps を返す設計への変更
4. **AdditionalRuleの実装** - 追加ルールの動作確認
5. **既存CardEffectRegistryの削除** - 移行完了、コードベースの整理

各フェーズの詳細なタスク分解、実装順序、テスト戦略は、実装仕様（spec）で定義します

## Validation

**Implementation Date**: 2025-01-28

**Test Results**:
- Total Tests: 442 passed
- Coverage: 90%+ (all new models, registries, and effects)
- Integration Tests: All passing (ChickenGame, NormalSpells)

**Implementation Validation**:
- ✅ ChainableAction基盤実装完了 (T001-T011)
- ✅ AdditionalRule基盤実装完了 (T012-T018)
- ✅ ActivateSpellCommandリファクタリング完了 (T019-T025)
- ✅ Chicken Game実装完了 (T026-T035)
- ✅ Legacy cleanup完了 (T036-T042)

### テストケース

各フェーズごとに以下を確認：

```bash
npm run test:run      # すべてのテスト実行
npm run check         # TypeScriptコンパイル
npm run lint          # ESLint
npm run build         # ビルド確認
```

### Clean Architecture 検証

```typescript
// ✅ 検証: Domain層がApplication層に依存しない
// domain/commands/ActivateSpellCommand.ts
import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";
// ← このようなimportが存在しないことを確認

// ✅ 検証: effectStepsが正しく返される
describe("ActivateSpellCommand", () => {
  it("should return effectSteps without executing them", () => {
    const command = new ActivateSpellCommand(cardInstanceId);
    const result = command.execute(initialState);

    expect(result.success).toBe(true);
    expect(result.effectSteps).toBeDefined();
    expect(result.effectSteps?.length).toBeGreaterThan(0);
    // ← effectStepsが実行されていないことを確認
  });
});
```

### 効果モデル検証

```typescript
// ✅ 検証: ChainableActionの3ステップ構成
describe("PotOfGreedEffect", () => {
  it("should separate activation and resolution steps", () => {
    const effect = new PotOfGreedEffect();

    // ACTIVATION（即座に実行）
    const activationSteps = effect.createActivationSteps(state);
    expect(activationSteps).toHaveLength(0); // 通常魔法はアクティベーションステップなし

    // RESOLUTION（チェーン解決時に実行）
    const resolutionSteps = effect.createResolutionSteps(state, instanceId);
    expect(resolutionSteps).toHaveLength(1);
    expect(resolutionSteps[0].id).toBe("pot-of-greed-draw");
  });
});

// ✅ 検証: AdditionalRuleのカテゴリフィルタ
describe("AdditionalRuleRegistry", () => {
  it("should filter rules by category", () => {
    const statusModifiers = AdditionalRuleRegistry.getByCategory(cardId, "StatusModifier");
    const permissions = AdditionalRuleRegistry.getByCategory(cardId, "ActionPermission");

    expect(statusModifiers).toHaveLength(1);
    expect(permissions).toHaveLength(0);
  });

  it("should collect active rules from field", () => {
    const activeRules = AdditionalRuleRegistry.collectActiveRules(
      state,
      "StatusModifier"
    );

    expect(activeRules.length).toBeGreaterThan(0);
    expect(activeRules.every(r => r.canApply(state, {}))).toBe(true);
  });
});
```

## Related Documents

- [ADR-0005: Card Effect Architecture における Strategy Pattern 採用](./0005-card-effect-strategy-pattern.md)
- [ADR-0007: Domain Layer Refactoring](./0007-domain-layer-refactoring.md) ← **Post-Implementation Issue を根本解決**
- [効果モデル](../domain/effect-model.md) - ドメイン知識
- [アーキテクチャ概要](../architecture/overview.md)
- [チェーンシステム](../domain/chain-system.md)

## References

- [Conditions, Activations, and Effects](https://www.yugioh-card.com/eu/play/understanding-card-text/part-3-conditions-activations-and-effects/) - 遊戯王OCG公式ルール
- Clean Architecture (Robert C. Martin)
- Strategy Pattern (Gang of Four)
- Registry Pattern (Martin Fowler, Patterns of Enterprise Application Architecture)

## Post-Implementation Notes

### 達成された成果

**Clean Architecture の完全実現**:
- Domain Layer が Application Layer に依存しない設計を達成
- `IEffectResolutionService` の削除により、DI が不要に
- `effectSteps` を返す設計により、責務が明確化

**効果の体系化**:
- ChainableAction と AdditionalRule による効果の体系的管理
- 公式ルール (CONDITIONS/ACTIVATION/RESOLUTION) に準拠
- Registry Pattern による O(1) 高速ルックアップ

**実装されたカード効果**:
- Pot of Greed (強欲な壺)
- Graceful Charity (天使の施し)
- Chicken Game (チキンレース) - カード発動、起動効果、永続効果

**テストカバレッジ**:
- 442 テスト全パス
- カバレッジ 90%+ 維持
- 単体テスト、統合テスト、E2Eテストの完備

### 学んだ教訓

**成功したアプローチ**:
- User Story ベースのタスク分割により、独立したテストと段階的な実装が可能に
- Registry Pattern の統一により、コードベースが整理された
- 公式ルールとの対応を明確にすることで、ドキュメントとコードの一貫性が向上

**改善の余地**:
- `effectSteps` の型安全性 (現在は同期関数に統一済み)
- AdditionalRule の `apply`/`checkPermission`/`replace` の使い分けの文書化

## Future Work

### チェーンシステムの実装

ChainableAction を基盤として、チェーンシステムを実装：

- **ChainStack**: チェーンブロックの管理
- **チェーン解決**: 逆順（LIFO）での効果解決
- **スペルスピードチェック**: チェーン可否の判定

### 複雑な効果の実装

AdditionalRule を活用した高度な効果：

- **永続効果の自動適用**: フィールド全体のルール収集と適用
- **破壊耐性**: ActionReplacement による処理置換
- **特殊勝利条件**: VictoryCondition による勝利判定拡張

### EffectResolutionStep の型安全性向上

現在は同期関数 `(state: GameState) => GameStateUpdateResult` に統一済み。
将来的には、ユーザー選択を伴う効果の場合に `selectedInstanceIds` を受け取る拡張を検討。
