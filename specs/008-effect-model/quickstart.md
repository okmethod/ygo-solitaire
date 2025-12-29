# Effect Model Implementation - Quickstart Guide

**Target Audience**: 実装者（開発者）  
**Prerequisites**: TypeScript, Svelte 5, Clean Architecture の基礎知識  
**Related**: [data-model.md](./data-model.md), [research.md](./research.md)

---

## Overview

効果モデル（ChainableAction と AdditionalRule）を使った新規カード効果の実装方法を説明します。

**実装の流れ**:
1. ChainableAction の実装（カード発動・効果発動）
2. AdditionalRule の実装（永続効果・ルール効果）
3. Registry への登録
4. テスト実装

---

## 1. ChainableAction の実装

### 1-1. ファイル作成

`domain/effects/chainable/` に新規ファイルを作成：

```bash
touch skeleton-app/src/lib/domain/effects/chainable/YourCardAction.ts
```

### 1-2. インターフェース実装

```typescript
/**
 * YourCardAction - [カード名] の効果実装
 * 
 * Card ID: [カードID]
 * Effect: [効果の説明]
 */

import type { ChainableAction } from "$lib/domain/models/ChainableAction";
import type { GameState } from "$lib/domain/models/GameState";
import type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";
import { drawCards } from "$lib/domain/models/Zone";

export class YourCardAction implements ChainableAction {
  // カードの発動 or 効果の発動
  readonly isCardActivation = true; // カード発動の場合: true, 起動効果の場合: false
  
  // スペルスピード (1: Normal, 2: Quick-Play, 3: Counter)
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   */
  canActivate(state: GameState): boolean {
    // フェーズチェック
    if (state.phase !== "Main1") return false;
    
    // コストチェック（例: LP >= 1000）
    if (state.lp.player < 1000) return false;
    
    // その他の条件（例: デッキ枚数）
    if (state.zones.deck.length < 2) return false;
    
    // 1ターンに1度制限（必要な場合）
    const effectKey = `${this.cardInstanceId}:your-card-effect`;
    if (state.activatedIgnitionEffectsThisTurn.has(effectKey)) {
      return false; // 既に発動済み
    }
    
    return true;
  }

  /**
   * ACTIVATION: 発動時の処理（即座に実行）
   */
  createActivationSteps(state: GameState): EffectResolutionStep[] {
    // 通常魔法の場合は空配列を返す（即座に実行する処理なし）
    return [];
    
    // コスト支払いや対象指定が必要な場合:
    // return [
    //   {
    //     id: "your-card-cost",
    //     title: "コストを支払います",
    //     message: "1000LPを支払います",
    //     action: (state) => {
    //       const newLp = { ...state.lp, player: state.lp.player - 1000 };
    //       return { success: true, newState: { ...state, lp: newLp } };
    //     }
    //   }
    // ];
  }

  /**
   * RESOLUTION: 効果解決時の処理（チェーン解決時に実行）
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      {
        id: "your-card-effect",
        title: "効果を解決します",
        message: "デッキから2枚ドローします",
        action: (state: GameState) => {
          // ドロー処理
          const newZones = drawCards(state.zones, 2);
          
          return {
            success: true,
            newState: { ...state, zones: newZones },
            message: "Drew 2 cards",
          };
        },
      },
      // 通常魔法の場合、グレーブ送りステップは自動追加される（NormalSpellEffectの場合）
      // 手動で追加する場合:
      // {
      //   id: "your-card-to-grave",
      //   title: "墓地に送ります",
      //   message: "効果を使用した魔法カードを墓地に送ります",
      //   action: (state) => {
      //     const newZones = sendToGraveyard(state.zones, activatedCardInstanceId);
      //     return { success: true, newState: { ...state, zones: newZones } };
      //   }
      // }
    ];
  }
}
```

### 1-3. Registry への登録

```typescript
// domain/effects/index.ts または application層の初期化処理

import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
import { YourCardAction } from "$lib/domain/effects/chainable/YourCardAction";

// カードIDで登録
ChainableActionRegistry.register(YOUR_CARD_ID, new YourCardAction());
```

---

## 2. AdditionalRule の実装

### 2-1. ファイル作成

`domain/effects/additional/` に新規ファイルを作成：

```bash
touch skeleton-app/src/lib/domain/effects/additional/YourCardRule.ts
```

### 2-2. インターフェース実装

```typescript
/**
 * YourCardRule - [カード名] の永続効果実装
 * 
 * Card ID: [カードID]
 * Effect: [効果の説明]
 */

import type { AdditionalRule, RuleCategory, RuleContext } from "$lib/domain/models/AdditionalRule";
import type { GameState } from "$lib/domain/models/GameState";

export class YourCardRule implements AdditionalRule {
  // ルール上「効果」にあたるか（true: 無効化可能, false: 効果外テキスト）
  readonly isEffect = true;
  
  // ルールのカテゴリ
  readonly category: RuleCategory = "ActionPermission"; // 適切なカテゴリを選択

  /**
   * 適用条件チェック
   */
  canApply(state: GameState, context: RuleContext): boolean {
    // カードがフィールドに存在するか
    const cardOnField = state.zones.field.some(
      card => card.id === YOUR_CARD_ID && card.position === "faceUp"
    );
    if (!cardOnField) return false;
    
    // その他の条件（例: LP差分）
    const damageTarget = context.damageTarget || "player";
    if (damageTarget === "player") {
      return state.lp.player < state.lp.opponent;
    }
    
    return true;
  }

  /**
   * データ書き換え系（NameOverride, StatusModifier）
   */
  apply?(state: GameState, context: RuleContext): GameState {
    // 例: 攻撃力+1000
    // const targetCard = state.zones.field.find(c => c.instanceId === context.targetCardInstanceId);
    // if (!targetCard) return state;
    // 
    // const newField = state.zones.field.map(c =>
    //   c.instanceId === context.targetCardInstanceId
    //     ? { ...c, atk: c.atk + 1000 }
    //     : c
    // );
    // 
    // return { ...state, zones: { ...state.zones, field: newField } };
    
    return state;
  }

  /**
   * 判定追加・制限系（SummonCondition, Permission, VictoryCondition）
   */
  checkPermission?(state: GameState, context: RuleContext): boolean {
    // 例: ダメージ無効化
    return false; // false = 禁止
    
    // 例: 攻撃可能判定
    // return true; // true = 許可
  }

  /**
   * 処理置換・フック系（ActionReplacement, SelfDestruction）
   */
  replace?(state: GameState, context: RuleContext): GameState {
    // 例: 破壊される → デッキに戻る
    // const targetCard = state.zones.field.find(c => c.instanceId === context.targetCardInstanceId);
    // if (!targetCard) return state;
    // 
    // const newField = state.zones.field.filter(c => c.instanceId !== context.targetCardInstanceId);
    // const newDeck = [...state.zones.deck, targetCard];
    // 
    // return { ...state, zones: { ...state.zones, field: newField, deck: newDeck } };
    
    return state;
  }
}
```

### 2-3. Registry への登録

```typescript
// domain/effects/index.ts

import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
import { YourCardRule } from "$lib/domain/effects/additional/YourCardRule";

// カードIDで登録（1枚のカードに複数ルール可）
AdditionalRuleRegistry.register(YOUR_CARD_ID, new YourCardRule());
```

---

## 3. テスト実装

### 3-1. 単体テスト（ChainableAction）

```bash
touch skeleton-app/tests/unit/domain/effects/chainable/YourCardAction.test.ts
```

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { YourCardAction } from "$lib/domain/effects/chainable/YourCardAction";
import { createInitialGameState } from "$lib/domain/models/GameState";

describe("YourCardAction", () => {
  let action: YourCardAction;
  let state: GameState;

  beforeEach(() => {
    action = new YourCardAction();
    state = createInitialGameState([/* deck cards */]);
  });

  describe("canActivate", () => {
    it("should return true when conditions are met", () => {
      const result = action.canActivate(state);
      expect(result).toBe(true);
    });

    it("should return false when deck has insufficient cards", () => {
      const stateWithSmallDeck = { ...state, zones: { ...state.zones, deck: [] } };
      const result = action.canActivate(stateWithSmallDeck);
      expect(result).toBe(false);
    });
  });

  describe("createActivationSteps", () => {
    it("should return empty array for normal spell", () => {
      const steps = action.createActivationSteps(state);
      expect(steps).toEqual([]);
    });
  });

  describe("createResolutionSteps", () => {
    it("should return effect resolution steps", () => {
      const steps = action.createResolutionSteps(state, "card-instance-id");
      
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("your-card-effect");
      expect(steps[0].title).toBe("効果を解決します");
    });

    it("should draw 2 cards when action is executed", () => {
      const steps = action.createResolutionSteps(state, "card-instance-id");
      const result = steps[0].action(state);
      
      expect(result.success).toBe(true);
      expect(result.newState.zones.hand.length).toBe(state.zones.hand.length + 2);
    });
  });
});
```

### 3-2. 単体テスト（AdditionalRule）

```bash
touch skeleton-app/tests/unit/domain/effects/additional/YourCardRule.test.ts
```

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { YourCardRule } from "$lib/domain/effects/additional/YourCardRule";
import { createInitialGameState } from "$lib/domain/models/GameState";

describe("YourCardRule", () => {
  let rule: YourCardRule;
  let state: GameState;

  beforeEach(() => {
    rule = new YourCardRule();
    state = createInitialGameState([]);
  });

  describe("canApply", () => {
    it("should return true when card is on field and LP condition is met", () => {
      // カードをフィールドに配置
      const stateWithCard = {
        ...state,
        zones: {
          ...state.zones,
          field: [{ id: YOUR_CARD_ID, position: "faceUp", /* ... */ }],
        },
        lp: { player: 1000, opponent: 2000 },
      };
      
      const result = rule.canApply(stateWithCard, { damageTarget: "player" });
      expect(result).toBe(true);
    });

    it("should return false when card is not on field", () => {
      const result = rule.canApply(state, {});
      expect(result).toBe(false);
    });
  });

  describe("checkPermission", () => {
    it("should return false to prevent damage", () => {
      const result = rule.checkPermission?.(state, {});
      expect(result).toBe(false);
    });
  });
});
```

### 3-3. 統合テスト

```bash
touch skeleton-app/tests/integration/card-effects/YourCard.test.ts
```

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { gameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { get } from "svelte/store";

describe("YourCard - Integration Test", () => {
  beforeEach(() => {
    gameFacade.initializeGame([YOUR_CARD_ID, /* other cards */]);
  });

  it("should activate card and resolve effect correctly", async () => {
    const initialState = get(gameStateStore);
    const cardInHand = initialState.zones.hand[0];
    
    // カード発動
    const result = gameFacade.activateSpell(cardInHand.instanceId);
    expect(result.success).toBe(true);
    
    // 効果解決後の状態確認
    const finalState = get(gameStateStore);
    expect(finalState.zones.hand.length).toBe(initialState.zones.hand.length + 1); // ドロー後
  });
});
```

---

## 4. Chicken Game (チキンレース) 実装例

### 4-1. ChickenGameActivation (カード発動)

```typescript
// domain/effects/chainable/ChickenGameActivation.ts

export class ChickenGameActivation implements ChainableAction {
  readonly isCardActivation = true;
  readonly spellSpeed = 1 as const;

  canActivate(state: GameState): boolean {
    // フィールド魔法ゾーンが空か（簡易実装: field.length === 0）
    return state.zones.field.length === 0;
  }

  createActivationSteps(state: GameState): EffectResolutionStep[] {
    return []; // フィールド魔法は発動と同時に配置（ActivateSpellCommandで処理）
  }

  createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
    return []; // フィールド魔法は解決ステップなし（発動と同時に適用）
  }
}
```

### 4-2. ChickenGameIgnitionEffect (起動効果)

```typescript
// domain/effects/chainable/ChickenGameIgnitionEffect.ts

export class ChickenGameIgnitionEffect implements ChainableAction {
  readonly isCardActivation = false; // 効果の発動
  readonly spellSpeed = 1 as const;

  constructor(private readonly cardInstanceId: string) {}

  canActivate(state: GameState): boolean {
    if (state.phase !== "Main1") return false;
    if (state.lp.player < 1000) return false;

    // 1ターンに1度制限
    const effectKey = `${this.cardInstanceId}:chicken-game-ignition`;
    if (state.activatedIgnitionEffectsThisTurn.has(effectKey)) {
      return false;
    }

    return true;
  }

  createActivationSteps(state: GameState): EffectResolutionStep[] {
    return [
      {
        id: "chicken-game-cost",
        title: "コストを支払います",
        message: "1000LPを支払います",
        action: (state) => {
          const newLp = { ...state.lp, player: state.lp.player - 1000 };
          
          // 発動履歴を記録
          const effectKey = `${this.cardInstanceId}:chicken-game-ignition`;
          const newActivatedEffects = new Set([
            ...state.activatedIgnitionEffectsThisTurn,
            effectKey,
          ]);
          
          return {
            success: true,
            newState: {
              ...state,
              lp: newLp,
              activatedIgnitionEffectsThisTurn: newActivatedEffects,
            },
          };
        },
      },
    ];
  }

  createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
    // 選択肢提示（本specでは簡易的に1つ目の選択肢のみ実装）
    return [
      {
        id: "chicken-game-draw",
        title: "効果を解決します",
        message: "デッキから1枚ドローします",
        action: (state) => {
          const newZones = drawCards(state.zones, 1);
          return { success: true, newState: { ...state, zones: newZones } };
        },
      },
    ];
  }
}
```

### 4-3. ChickenGameContinuousRule (永続効果)

```typescript
// domain/effects/additional/ChickenGameContinuousRule.ts

export class ChickenGameContinuousRule implements AdditionalRule {
  readonly isEffect = true;
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
    return false; // ダメージ禁止
  }
}
```

---

## 5. よくある質問

### Q1: ChainableAction と CardEffect の違いは？

**A**: ChainableAction は公式ルールのCONDITIONS/ACTIVATION/RESOLUTIONに対応した新システムです。CardEffect は旧システムで、Phase 5で削除予定です。

### Q2: createActivationSteps が空配列の場合は？

**A**: 通常魔法のように、発動時に即座に実行する処理がない場合は空配列を返します。コスト支払いや対象指定がある場合は、ステップを追加します。

### Q3: AdditionalRule の apply/checkPermission/replace はすべて実装すべき？

**A**: カテゴリに応じて必要なメソッドのみ実装します。
- データ書き換え系 → `apply()`
- 判定追加・制限系 → `checkPermission()`
- 処理置換系 → `replace()`

### Q4: 1ターンに1度制限はどう実装する？

**A**: `GameState.activatedIgnitionEffectsThisTurn` に `${cardInstanceId}:${effectId}` を記録し、`canActivate()` でチェックします。

### Q5: テストカバレッジの目標は？

**A**: 90%以上を目標とします。ChainableAction/AdditionalRuleの新規実装は100%カバーを推奨します。

---

## 6. Next Steps

1. Phase 1完了: モデル定義とRegistry実装
2. Phase 2: 既存カード（Pot of Greed, Graceful Charity）の移行
3. Phase 3: ActivateSpellCommandのリファクタリング
4. Phase 4: Chicken Gameの実装
5. Phase 5: 既存CardEffectRegistryの削除

**詳細なタスク分解**: `/speckit.tasks` コマンドで生成
