# ADR-0005: Card Effect ArchitectureにおけるStrategy Pattern採用

## Status
✅ Accepted (2024-12-07)

## Context

spec/004-card-effect-execution（カード効果実行システム）の実装において、カード固有の効果処理をどのように設計するかが課題となりました。

### 従来の実装（アンチパターン）

`ActivateSpellCommand`にカードID分岐を直接実装する方法：

```typescript
// ❌ Bad: Open/Closed Principle違反
class ActivateSpellCommand implements GameCommand {
  execute(state: GameState): CommandResult {
    const cardId = parseInt(cardInstance.cardId, 10);

    // カードIDで分岐
    if (cardId === 55144522) {
      // Pot of Greed: 2枚ドロー
      const steps: EffectResolutionStep[] = [
        {
          id: "pot-of-greed-draw",
          title: "カードをドローします",
          message: "デッキから2枚ドローします",
          action: () => {
            const drawCmd = new DrawCardCommand(2);
            const result = drawCmd.execute(get(gameStateStore));
            if (result.success) {
              gameStateStore.set(result.newState);
            }
          },
        },
      ];
      effectResolutionStore.startResolution(steps);
    } else if (cardId === 79571449) {
      // Graceful Charity: 3枚ドロー、2枚破棄
      // ... (同様の処理)
    }
    // ... 新しいカード追加のたびに分岐が増える

    // 墓地送り処理（共通）
    const zonesAfterResolution = sendToGraveyard(zonesAfterActivation, this.cardInstanceId);
    return createSuccessResult(finalState, `Spell card activated`);
  }
}
```

### 問題点

1. **Open/Closed Principle違反**:
   - 新しいカード追加時に`ActivateSpellCommand`を変更しなければならない
   - if/else分岐が肥大化し、保守性が低下
   - 1つのクラスが複数のカード効果を知っている（Single Responsibility違反）

2. **テスト困難性**:
   - カード固有のテストと普遍的なCommandフローテストが混在
   - `ActivateSpellCommand.test.ts`が肥大化する
   - モックやスパイが複雑化

3. **拡張性の欠如**:
   - カード種別（魔法/罠、通常/速攻/永続）の共通処理を再利用できない
   - デッキ枚数チェックなどのバリデーションが分散

4. **過去の知見との乖離**:
   - ADR-0003で削除された旧Effect Systemは、`BaseMagicEffect` → `PotOfGreedEffect`の階層構造を持っていた
   - 削除理由はDuelState（mutable）との依存だったが、GameState（immutable）への移行後も階層構造の利点は有効

## Decision

**Strategy PatternとRegistryパターンを組み合わせたCard Effect Architectureを採用する**

### アーキテクチャ概要

```
CardEffect (interface)
  ↓
SpellEffect (abstract class) - 魔法カード共通処理
  ↓
NormalSpellEffect (abstract class) - 通常魔法カード共通処理
  ↓
PotOfGreedEffect (concrete class) - 強欲な壺固有処理
```

### 実装方法

#### 1. CardEffect Interface

```typescript
/**
 * CardEffect - すべてのカード効果の基底インターフェース
 */
export interface CardEffect {
  /**
   * カード効果を発動可能かチェック
   */
  canActivate(state: GameState): boolean;

  /**
   * 効果解決ステップを生成
   */
  createSteps(state: GameState): EffectResolutionStep[];
}
```

#### 2. SpellEffect Base Class

```typescript
/**
 * SpellEffect - すべての魔法カード共通処理
 */
export abstract class SpellEffect implements CardEffect {
  canActivate(state: GameState): boolean {
    // 共通バリデーション: ゲーム終了チェック
    if (state.result.isGameOver) {
      return false;
    }
    return this.canActivateSpell(state);
  }

  protected abstract canActivateSpell(state: GameState): boolean;
  abstract createSteps(state: GameState): EffectResolutionStep[];
}
```

#### 3. NormalSpellEffect Base Class

```typescript
/**
 * NormalSpellEffect - 通常魔法カード共通処理
 */
export abstract class NormalSpellEffect extends SpellEffect {
  protected canActivateSpell(state: GameState): boolean {
    // 通常魔法のみのバリデーション: Main1フェーズチェック
    if (state.phase !== "Main1") {
      return false;
    }
    return this.canActivateNormalSpell(state);
  }

  protected abstract canActivateNormalSpell(state: GameState): boolean;
}
```

#### 4. Concrete Card Effect

```typescript
/**
 * PotOfGreedEffect - 強欲な壺（カードID: 55144522）
 */
export class PotOfGreedEffect extends NormalSpellEffect {
  protected canActivateNormalSpell(state: GameState): boolean {
    // カード固有のバリデーション: デッキ2枚以上
    return state.zones.deck.length >= 2;
  }

  createSteps(state: GameState): EffectResolutionStep[] {
    return [
      {
        id: "pot-of-greed-draw",
        title: "カードをドローします",
        message: "デッキから2枚ドローします",
        action: () => {
          const drawCmd = new DrawCardCommand(2);
          const result = drawCmd.execute(get(gameStateStore));
          if (result.success) {
            gameStateStore.set(result.newState);
          }
        },
      },
    ];
  }
}
```

#### 5. CardEffectRegistry

```typescript
/**
 * CardEffectRegistry - カードID → CardEffect インスタンスのマッピング
 */
export class CardEffectRegistry {
  private static effects = new Map<number, CardEffect>();

  static register(cardId: number, effect: CardEffect): void {
    this.effects.set(cardId, effect);
  }

  static get(cardId: number): CardEffect | undefined {
    return this.effects.get(cardId);
  }

  static clear(): void {
    this.effects.clear();
  }
}

// 初期化（src/lib/domain/effects/index.ts）
CardEffectRegistry.register(55144522, new PotOfGreedEffect());       // 強欲な壺
CardEffectRegistry.register(79571449, new GracefulCharityEffect());  // 天使の施し
```

#### 6. ActivateSpellCommandとの統合

```typescript
// ✅ Good: Strategy Pattern
class ActivateSpellCommand implements GameCommand {
  execute(state: GameState): CommandResult {
    // Step 1: 手札からフィールドへ
    const zonesAfterActivation = moveCard(state.zones, this.cardInstanceId, "hand", "field", "faceUp");

    // Step 2: カード効果実行
    const cardId = parseInt(cardInstance.cardId, 10);
    const effect = CardEffectRegistry.get(cardId);

    if (effect) {
      if (!effect.canActivate(state)) {
        return createFailureResult(state, "Cannot activate card effect");
      }
      const steps = effect.createSteps(state);
      effectResolutionStore.startResolution(steps);
    }

    // Step 3: フィールドから墓地へ
    const zonesAfterResolution = sendToGraveyard(zonesAfterActivation, this.cardInstanceId);

    // Step 4: 勝利条件チェック
    const victoryResult = checkVictoryConditions(newState);
    const finalState = produce(newState, (draft) => {
      draft.result = victoryResult;
    });

    return createSuccessResult(finalState, `Spell card activated`);
  }
}
```

## Consequences

### Positive

✅ **Open/Closed Principleの遵守**
- 新しいカード追加時: 新しいCardEffectクラスを作成し、Registry登録のみ
- 既存コード（`ActivateSpellCommand`）への変更不要

✅ **テスト責務の明確化**
- `ActivateSpellCommand.test.ts`: Commandフローの普遍的なテスト（手札→フィールド→墓地）
- `CardEffects.test.ts`: カード固有の効果処理テスト（effectResolutionStore呼び出し）
- `tests/unit/card-effects/PotOfGreedEffect.test.ts`: 個別カードのUnit Test

✅ **共通処理の再利用**
- `SpellEffect`: すべての魔法カード共通（ゲーム終了チェック）
- `NormalSpellEffect`: 通常魔法共通（Main1フェーズチェック）
- `QuickPlaySpellEffect`: 速攻魔法共通（Main1/Main2/Battle/相手ターン）
- 継承により共通バリデーションを自動適用

✅ **拡張性の確保**
- 速攻魔法・永続魔法・罠カードへの対応が容易
- カード種別ごとの基底クラスを追加するのみ

✅ **型安全性の向上**
- CardEffectインターフェースにより、すべてのカード効果が同じ契約を満たす
- ActivateSpellCommandは具体的なカード種別を知る必要がない（Liskov Substitution Principle）

### Negative

❌ **クラス数の増加**
- 各カードに1つのクラス（50枚実装時 = 50クラス + 基底クラス数個）
- ファイル数増加によるディレクトリ構造の複雑化

**対策**:
- カード数が10枚以下のうちは1ディレクトリに集約
- 20枚を超えたら種別ごとにサブディレクトリ分割（`cards/normal-spells/`, `cards/quick-play-spells/`）

❌ **初期化コストの微増**
- Registry登録処理（アプリケーション起動時）
- O(n)のコスト（nはカード種類数）

**対策**:
- 初回ロード時のみ実行（セッション中は再実行不要）
- カード数が100枚程度ならユーザー体感なし（<10ms）

❌ **シンプルなカードでもクラス作成が必要**
- 効果を持たないカード（バニラモンスター等）もCardEffectインスタンスが必要

**対策**:
- `NoEffect`クラスを用意し、効果なしカードで共有
- Registry登録不要（`CardEffectRegistry.get()`がundefinedを返す仕様）

### Neutral

⚖️ **旧Effect Systemとの類似性**
- ADR-0003で削除された旧システムと階層構造が類似
- 削除理由（DuelState依存）は解消済み（GameState使用）
- 旧実装の知見を活用できる

⚖️ **学習コストの変化**
- Strategy Patternの理解が必要（新規開発者）
- 一度理解すれば、新しいカード追加は定型作業化

## Alternatives Considered

### Alternative 1: if/else分岐をそのまま使用（現状維持）

```typescript
// 却下された案
class ActivateSpellCommand {
  execute(state: GameState): CommandResult {
    if (cardId === 55144522) {
      // Pot of Greed処理
    } else if (cardId === 79571449) {
      // Graceful Charity処理
    }
    // ... カード追加のたびに分岐が増える
  }
}
```

**却下理由**:
- Open/Closed Principle違反
- カード数増加に伴う保守性の低下
- テストの複雑化

### Alternative 2: 関数ベースのStrategy Pattern

```typescript
// 却下された案
const CARD_EFFECTS: Record<number, (state: GameState) => EffectResolutionStep[]> = {
  55144522: (state) => [
    {
      id: "pot-of-greed-draw",
      title: "カードをドローします",
      message: "デッキから2枚ドローします",
      action: () => { /* ... */ },
    },
  ],
  79571449: (state) => { /* ... */ },
};
```

**却下理由**:
- バリデーション（`canActivate`）と効果生成（`createSteps`）の分離が困難
- 共通処理（SpellEffect, NormalSpellEffect）の再利用が不可能
- 型安全性の低下（関数シグネチャの強制が弱い）

### Alternative 3: CardEffectRegistryを使わず、各CardEffectクラスでカードIDを保持

```typescript
// 却下された案
export class PotOfGreedEffect extends NormalSpellEffect {
  readonly cardId = 55144522;
  // ...
}

// ActivateSpellCommandで全CardEffectを検索
const allEffects = [new PotOfGreedEffect(), new GracefulCharityEffect()];
const effect = allEffects.find(e => e.cardId === cardId);
```

**却下理由**:
- 効果検索がO(n)（Registryを使えばO(1)）
- カード数増加時のパフォーマンス懸念
- 初期化コードが分散（各CardEffectクラスで`cardId`を定義）

## Implementation

### ファイル構成

```
src/lib/domain/effects/
├── CardEffect.ts              # CardEffect interface
├── CardEffectRegistry.ts      # Registry実装 + テスト用clear()
├── bases/
│   ├── SpellEffect.ts         # 魔法カード基底クラス
│   ├── NormalSpellEffect.ts   # 通常魔法カード基底クラス
│   └── QuickPlaySpellEffect.ts # 速攻魔法カード基底クラス（将来）
├── cards/
│   ├── PotOfGreedEffect.ts    # 強欲な壺
│   └── GracefulCharityEffect.ts # 天使の施し
└── index.ts                   # Registry初期化 + エクスポート
```

### 実装ステップ（T013-T020）

1. ✅ T013: `CardEffect.ts` interface定義
2. ✅ T014: `CardEffectRegistry.ts` 実装
3. ✅ T015: `SpellEffect.ts` 基底クラス実装
4. ✅ T016: `NormalSpellEffect.ts` 基底クラス実装
5. ✅ T017: Unit Test - `CardEffectRegistry.test.ts`
6. ✅ T018: `PotOfGreedEffect.ts` 実装
7. ✅ T019: Unit Test - `PotOfGreedEffect.test.ts`
8. ✅ T020: `index.ts` で Registry初期化

### 移行ステップ（T021-T026）

1. ✅ T021: `ActivateSpellCommand`のif/else分岐をRegistry呼び出しに置き換え
2. ✅ T022: 既存テスト（`CardEffects.test.ts`）を新アーキテクチャに対応
3. ✅ T023: Pot of Greed効果のE2Eテスト実行
4. ✅ T024: 全Unit Test実行（239 tests passing）
5. ✅ T025: Linter/Formatter実行
6. ✅ T026: Phase 1完了確認

## Validation

### テスト戦略

#### 1. Unit Tests

**CardEffectRegistry.test.ts**:
```typescript
describe("CardEffectRegistry", () => {
  it("should return registered effect for valid card ID", () => {
    CardEffectRegistry.register(55144522, new PotOfGreedEffect());
    expect(CardEffectRegistry.get(55144522)).toBeInstanceOf(PotOfGreedEffect);
  });

  it("should return undefined for unregistered card ID", () => {
    expect(CardEffectRegistry.get(99999999)).toBeUndefined();
  });
});
```

**PotOfGreedEffect.test.ts**:
```typescript
describe("PotOfGreedEffect", () => {
  it("canActivate should return false when deck has only 1 card", () => {
    const state = createMockGameState({
      phase: "Main1",
      zones: { deck: createCardInstances(["card1"], "deck") },
    });
    const effect = new PotOfGreedEffect();
    expect(effect.canActivate(state)).toBe(false);
  });

  it("createSteps should create draw step with correct properties", () => {
    const effect = new PotOfGreedEffect();
    const steps = effect.createSteps(createMockGameState());
    expect(steps).toHaveLength(1);
    expect(steps[0].id).toBe("pot-of-greed-draw");
    expect(steps[0].title).toBe("カードをドローします");
  });
});
```

#### 2. Integration Tests

**CardEffects.test.ts**:
```typescript
describe("Card Effects Integration", () => {
  it("should call effectResolutionStore for Pot of Greed", () => {
    const state = createMockGameState({
      hand: [{ instanceId: "pot-1", cardId: "55144522", location: "hand" }],
      deck: createCardInstances(["card1", "card2", "card3"], "deck"),
    });

    const spy = vi.spyOn(effectResolutionStore, "startResolution");
    const command = new ActivateSpellCommand("pot-1");
    command.execute(state);

    expect(spy).toHaveBeenCalledOnce();
  });
});
```

### パフォーマンス検証

- **Registry初期化**: 2カード登録時 < 1ms
- **効果検索**: Map.get() = O(1) < 0.1ms
- **全Unit Test実行時間**: 239 tests < 5秒

## Future Considerations

### 速攻魔法・永続魔法への拡張

```typescript
// QuickPlaySpellEffect（速攻魔法）
export abstract class QuickPlaySpellEffect extends SpellEffect {
  protected canActivateSpell(state: GameState): boolean {
    const validPhases = ["Main1", "Main2", "Battle"];
    return validPhases.includes(state.phase);
  }
}

// ContinuousSpellEffect（永続魔法）
export abstract class ContinuousSpellEffect extends SpellEffect {
  // フィールドに残る処理が必要
  // （実装詳細は将来のspecで定義）
}
```

### 罠カードへの拡張

```typescript
// TrapEffect（罠カード基底クラス）
export abstract class TrapEffect implements CardEffect {
  canActivate(state: GameState): boolean {
    // 罠カード: セット後1ターン経過が必要
    // （実装詳細は将来のspecで定義）
  }
}
```

### カード数増加時のディレクトリ再編

```
src/lib/domain/effects/cards/
├── normal-spells/
│   ├── PotOfGreedEffect.ts
│   └── GracefulCharityEffect.ts
├── quick-play-spells/
│   └── MysticalSpaceTyphoonEffect.ts
└── continuous-spells/
    └── SwordsOfRevealingLightEffect.ts
```

## Related Documents

- [ADR-0001: Clean Architectureの採用](./0001-adopt-clean-architecture.md)
- [ADR-0002: Immer.jsによる不変性保証](./0002-use-immer-for-immutability.md)
- [ADR-0003: Effect System廃止とCommand Pattern統一](./0003-abolish-effect-system.md)
- [Data Model Design](../architecture/data-model-design.md)
- [Testing Strategy](../architecture/testing-strategy.md)
- [spec/004-card-effect-execution/spec.md](../../specs/004-card-effect-execution/spec.md)
- [spec/004-card-effect-execution/plan.md](../../specs/004-card-effect-execution/plan.md)
- [spec/004-card-effect-execution/tasks.md](../../specs/004-card-effect-execution/tasks.md)

## References

- **Design Patterns**: Gang of Four - Strategy Pattern
- **SOLID Principles**: Open/Closed Principle, Liskov Substitution Principle
- **Discussion**: spec/004 設計レビュー（2024-12-07セッション）
- **Git commit**: TBD（Phase 3実装完了後）
- **PR**: TBD（spec/004完了PR）
