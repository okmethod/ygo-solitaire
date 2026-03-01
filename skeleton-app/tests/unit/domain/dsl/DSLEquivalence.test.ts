import { describe, it, expect, beforeEach } from "vitest";
import { loadCardFromYaml } from "$lib/domain/dsl/loader";
import { CardDataRegistry } from "$lib/domain/cards";
import { ChainableActionRegistry } from "$lib/domain/effects/actions/ChainableActionRegistry";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";

// クラスベース実装
import { PotOfGreedActivation } from "$lib/domain/effects/actions/activations/individuals/spells/PotOfGreedActivation";
import { GracefulCharityActivation } from "$lib/domain/effects/actions/activations/individuals/spells/GracefulCharityActivation";
import { UpstartGoblinActivation } from "$lib/domain/effects/actions/activations/individuals/spells/UpstartGoblinActivation";
import { MagicalStoneExcavationActivation } from "$lib/domain/effects/actions/activations/individuals/spells/MagicalStoneExcavationActivation";
import { TerraformingActivation } from "$lib/domain/effects/actions/activations/individuals/spells/TerraformingActivation";
import { RoyalMagicalLibraryIgnitionEffect } from "$lib/domain/effects/actions/ignitions/individuals/monsters/RoyalMagicalLibraryIgnitionEffect";
import { RoyalMagicalLibraryContinuousEffect } from "$lib/domain/effects/rules/continuouses/monsters/RoyalMagicalLibraryContinuousEffect";
import { AdditionalRuleRegistry } from "$lib/domain/effects/rules/AdditionalRuleRegistry";
import { IntoTheVoidActivation } from "$lib/domain/effects/actions/activations/individuals/spells/IntoTheVoidActivation";
import { CardOfDemiseActivation } from "$lib/domain/effects/actions/activations/individuals/spells/CardOfDemiseActivation";
import { DarkFactoryActivation } from "$lib/domain/effects/actions/activations/individuals/spells/DarkFactoryActivation";

/**
 * DSL Equivalence Tests
 *
 * TEST STRATEGY:
 * - DSL定義で登録されたカードがクラスベース実装と同等に動作すること
 * - canActivate, createActivationSteps, createResolutionSteps の挙動が一致すること
 */

// =============================================================================
// YAML定義
// =============================================================================

const POT_OF_GREED_YAML = `
id: 55144522
data:
  jaName: "強欲な壺"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "CAN_DRAW"
        args: { count: 2 }
    resolutions:
      - step: "DRAW"
        args: { count: 2 }
`;

const GRACEFUL_CHARITY_YAML = `
id: 79571449
data:
  jaName: "天使の施し"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "CAN_DRAW"
        args: { count: 3 }
    resolutions:
      - step: "DRAW"
        args: { count: 3 }
      - step: "THEN"
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
`;

const UPSTART_GOBLIN_YAML = `
id: 70368879
data:
  jaName: "成金ゴブリン"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "CAN_DRAW"
        args: { count: 1 }
    resolutions:
      - step: "DRAW"
        args: { count: 1 }
      - step: "GAIN_LP"
        args: { amount: 1000, target: "opponent" }
`;

const MAGICAL_STONE_EXCAVATION_YAML = `
id: 98494543
data:
  jaName: "魔法石の採掘"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "HAND_COUNT_EXCLUDING_SELF"
        args: { minCount: 2 }
      - step: "GRAVEYARD_HAS_SPELL"
        args: { minCount: 1 }
    activations:
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
    resolutions:
      - step: "SALVAGE_FROM_GRAVEYARD"
        args: { filterType: "spell", count: 1 }
`;

const TERRAFORMING_YAML = `
id: 73628505
data:
  jaName: "テラ・フォーミング"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "DECK_HAS_CARD"
        args: { filterType: "spell", filterSpellType: "field", minCount: 1 }
    resolutions:
      - step: "SEARCH_FROM_DECK"
        args: { filterType: "spell", filterSpellType: "field", count: 1 }
`;

// =============================================================================
// テストヘルパー
// =============================================================================

const createMockCardInstance = (cardId: number): CardInstance => ({
  instanceId: `instance-${cardId}`,
  id: cardId,
  jaName: "テストカード",
  type: "spell",
  frameType: "spell",
  spellType: "normal",
  location: "hand",
});

const createMockGameState = (deckCount: number, handCount: number = 0): GameSnapshot => {
  const deckCards = Array(deckCount)
    .fill(null)
    .map((_, i) => ({
      instanceId: `deck-card-${i}`,
      id: 1,
      jaName: "デッキカード",
      type: "monster" as const,
      frameType: "normal" as const,
      location: "mainDeck" as const,
    }));

  const handCards = Array(handCount)
    .fill(null)
    .map((_, i) => ({
      instanceId: `hand-card-${i}`,
      id: 2,
      jaName: "手札カード",
      type: "monster" as const,
      frameType: "normal" as const,
      location: "hand" as const,
    }));

  return {
    phase: "main1",
    turn: 1,
    lp: { player: 8000, opponent: 8000 },
    space: {
      mainDeck: deckCards,
      hand: handCards,
      extraDeck: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };
};

// =============================================================================
// 等価性テスト
// =============================================================================

describe("DSLEquivalence - Pot of Greed", () => {
  const CARD_ID = 55144522;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
  });

  it("spellSpeed が一致する", () => {
    loadCardFromYaml(POT_OF_GREED_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new PotOfGreedActivation();

    expect(dslActivation).toBeDefined();
    expect(dslActivation!.spellSpeed).toBe(classActivation.spellSpeed);
  });

  it("canActivate が同一条件で同じ結果を返す（条件成立）", () => {
    loadCardFromYaml(POT_OF_GREED_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new PotOfGreedActivation();
    const state = createMockGameState(5); // 十分なデッキ
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(true);
  });

  it("canActivate が同一条件で同じ結果を返す（条件不成立）", () => {
    loadCardFromYaml(POT_OF_GREED_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new PotOfGreedActivation();
    const state = createMockGameState(1); // デッキ不足
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("createResolutionSteps が同等のステップを生成する", () => {
    loadCardFromYaml(POT_OF_GREED_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new PotOfGreedActivation();
    const state = createMockGameState(5);
    const instance = createMockCardInstance(CARD_ID);

    const dslSteps = dslActivation!.createResolutionSteps(state, instance);
    const classSteps = classActivation.createResolutionSteps(state, instance);

    // draw-2 ステップが両方に存在すること
    expect(dslSteps.some((s) => s.id === "draw-2")).toBe(true);
    expect(classSteps.some((s) => s.id === "draw-2")).toBe(true);

    // 墓地送りステップが両方に存在すること（基底クラスが追加）
    expect(dslSteps.some((s) => s.id.includes("graveyard"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("graveyard"))).toBe(true);
  });
});

describe("DSLEquivalence - Graceful Charity", () => {
  const CARD_ID = 79571449;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
  });

  it("spellSpeed が一致する", () => {
    loadCardFromYaml(GRACEFUL_CHARITY_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new GracefulCharityActivation();

    expect(dslActivation).toBeDefined();
    expect(dslActivation!.spellSpeed).toBe(classActivation.spellSpeed);
  });

  it("canActivate が同一条件で同じ結果を返す（条件成立）", () => {
    loadCardFromYaml(GRACEFUL_CHARITY_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new GracefulCharityActivation();
    const state = createMockGameState(5);
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(true);
  });

  it("canActivate が同一条件で同じ結果を返す（条件不成立）", () => {
    loadCardFromYaml(GRACEFUL_CHARITY_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new GracefulCharityActivation();
    const state = createMockGameState(2); // デッキ不足（3枚必要）
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("createResolutionSteps が同等のステップを生成する", () => {
    loadCardFromYaml(GRACEFUL_CHARITY_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new GracefulCharityActivation();
    const state = createMockGameState(5);
    const instance = createMockCardInstance(CARD_ID);

    const dslSteps = dslActivation!.createResolutionSteps(state, instance);
    const classSteps = classActivation.createResolutionSteps(state, instance);

    // draw-3 ステップが両方に存在すること
    expect(dslSteps.some((s) => s.id === "draw-3")).toBe(true);
    expect(classSteps.some((s) => s.id === "draw-3")).toBe(true);

    // select-and-discard ステップが両方に存在すること
    expect(dslSteps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
  });
});

describe("DSLEquivalence - Upstart Goblin", () => {
  const CARD_ID = 70368879;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
  });

  it("spellSpeed が一致する", () => {
    loadCardFromYaml(UPSTART_GOBLIN_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new UpstartGoblinActivation();

    expect(dslActivation).toBeDefined();
    expect(dslActivation!.spellSpeed).toBe(classActivation.spellSpeed);
  });

  it("canActivate が同一条件で同じ結果を返す（条件成立）", () => {
    loadCardFromYaml(UPSTART_GOBLIN_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new UpstartGoblinActivation();
    const state = createMockGameState(3);
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(true);
  });

  it("canActivate が同一条件で同じ結果を返す（条件不成立）", () => {
    loadCardFromYaml(UPSTART_GOBLIN_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new UpstartGoblinActivation();
    const state = createMockGameState(0); // デッキ空
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("createResolutionSteps が同等のステップを生成する", () => {
    loadCardFromYaml(UPSTART_GOBLIN_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new UpstartGoblinActivation();
    const state = createMockGameState(3);
    const instance = createMockCardInstance(CARD_ID);

    const dslSteps = dslActivation!.createResolutionSteps(state, instance);
    const classSteps = classActivation.createResolutionSteps(state, instance);

    // draw-1 ステップが両方に存在すること
    expect(dslSteps.some((s) => s.id === "draw-1")).toBe(true);
    expect(classSteps.some((s) => s.id === "draw-1")).toBe(true);

    // gain-lp ステップが両方に存在すること
    expect(dslSteps.some((s) => s.id.includes("gain-lp"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("gain-lp"))).toBe(true);
  });
});

// =============================================================================
// Phase 4: User Story 2 - コスト付き魔法カードの等価性テスト
// =============================================================================

/**
 * Magical Stone Excavation のゲーム状態を作成
 * - 手札にカードが必要（コスト支払い用）
 * - 墓地に魔法カードが必要（サルベージ対象）
 */
const createMagicalStoneGameState = (handCount: number, graveyardSpellCount: number): GameSnapshot => {
  const handCards = Array(handCount)
    .fill(null)
    .map((_, i) => ({
      instanceId: `hand-card-${i}`,
      id: i + 100,
      jaName: `手札カード${i}`,
      type: "monster" as const,
      frameType: "normal" as const,
      location: "hand" as const,
    }));

  const graveyardSpells = Array(graveyardSpellCount)
    .fill(null)
    .map((_, i) => ({
      instanceId: `graveyard-spell-${i}`,
      id: i + 200,
      jaName: `墓地魔法${i}`,
      type: "spell" as const,
      frameType: "spell" as const,
      location: "graveyard" as const,
    }));

  return {
    phase: "main1",
    turn: 1,
    lp: { player: 8000, opponent: 8000 },
    space: {
      mainDeck: [],
      hand: handCards,
      extraDeck: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: graveyardSpells,
      banished: [],
    },
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };
};

/**
 * Terraforming のゲーム状態を作成
 * - デッキにフィールド魔法が必要（サーチ対象）
 */
const createTerraformingGameState = (deckFieldSpellCount: number): GameSnapshot => {
  const deckFieldSpells = Array(deckFieldSpellCount)
    .fill(null)
    .map((_, i) => ({
      instanceId: `deck-field-spell-${i}`,
      id: i + 300,
      jaName: `フィールド魔法${i}`,
      type: "spell" as const,
      frameType: "spell" as const,
      spellType: "field" as const,
      location: "mainDeck" as const,
    }));

  return {
    phase: "main1",
    turn: 1,
    lp: { player: 8000, opponent: 8000 },
    space: {
      mainDeck: deckFieldSpells,
      hand: [],
      extraDeck: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };
};

describe("DSLEquivalence - Magical Stone Excavation", () => {
  const CARD_ID = 98494543;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
  });

  it("spellSpeed が一致する", () => {
    loadCardFromYaml(MAGICAL_STONE_EXCAVATION_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new MagicalStoneExcavationActivation();

    expect(dslActivation).toBeDefined();
    expect(dslActivation!.spellSpeed).toBe(classActivation.spellSpeed);
  });

  it("canActivate が同一条件で同じ結果を返す（条件成立）", () => {
    loadCardFromYaml(MAGICAL_STONE_EXCAVATION_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new MagicalStoneExcavationActivation();
    // 手札3枚（自身除いて2枚）、墓地に魔法1枚
    const state = createMagicalStoneGameState(3, 1);
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(true);
  });

  it("canActivate が同一条件で同じ結果を返す（手札不足）", () => {
    loadCardFromYaml(MAGICAL_STONE_EXCAVATION_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new MagicalStoneExcavationActivation();
    // 手札1枚（自身除いて0枚）、墓地に魔法1枚
    const state = createMagicalStoneGameState(1, 1);
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("canActivate が同一条件で同じ結果を返す（墓地に魔法なし）", () => {
    loadCardFromYaml(MAGICAL_STONE_EXCAVATION_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new MagicalStoneExcavationActivation();
    // 手札3枚、墓地に魔法0枚
    const state = createMagicalStoneGameState(3, 0);
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("createActivationSteps がコスト支払いステップを生成する", () => {
    loadCardFromYaml(MAGICAL_STONE_EXCAVATION_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new MagicalStoneExcavationActivation();
    const state = createMagicalStoneGameState(3, 1);
    const instance = createMockCardInstance(CARD_ID);

    const dslSteps = dslActivation!.createActivationSteps(state, instance);
    const classSteps = classActivation.createActivationSteps(state, instance);

    // select-and-discard ステップが両方に存在すること（コスト支払い）
    expect(dslSteps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
  });

  it("createResolutionSteps がサルベージステップを生成する", () => {
    loadCardFromYaml(MAGICAL_STONE_EXCAVATION_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new MagicalStoneExcavationActivation();
    const state = createMagicalStoneGameState(3, 1);
    const instance = createMockCardInstance(CARD_ID);

    const dslSteps = dslActivation!.createResolutionSteps(state, instance);
    const classSteps = classActivation.createResolutionSteps(state, instance);

    // salvage/search ステップが両方に存在すること
    expect(dslSteps.some((s) => s.id.includes("salvage"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("salvage") || s.id.includes("search"))).toBe(true);
  });
});

describe("DSLEquivalence - Terraforming", () => {
  const CARD_ID = 73628505;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
  });

  it("spellSpeed が一致する", () => {
    loadCardFromYaml(TERRAFORMING_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new TerraformingActivation();

    expect(dslActivation).toBeDefined();
    expect(dslActivation!.spellSpeed).toBe(classActivation.spellSpeed);
  });

  it("canActivate が同一条件で同じ結果を返す（条件成立）", () => {
    loadCardFromYaml(TERRAFORMING_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new TerraformingActivation();
    const state = createTerraformingGameState(1); // フィールド魔法1枚
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(true);
  });

  it("canActivate が同一条件で同じ結果を返す（条件不成立）", () => {
    loadCardFromYaml(TERRAFORMING_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new TerraformingActivation();
    const state = createTerraformingGameState(0); // フィールド魔法なし
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("createResolutionSteps がサーチステップを生成する", () => {
    loadCardFromYaml(TERRAFORMING_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new TerraformingActivation();
    const state = createTerraformingGameState(1);
    const instance = createMockCardInstance(CARD_ID);

    const dslSteps = dslActivation!.createResolutionSteps(state, instance);
    const classSteps = classActivation.createResolutionSteps(state, instance);

    // search ステップが両方に存在すること
    expect(dslSteps.some((s) => s.id.includes("search"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("search"))).toBe(true);
  });
});

// =============================================================================
// Phase 5: User Story 3 - モンスター効果の等価性テスト
// =============================================================================

const ROYAL_MAGICAL_LIBRARY_YAML = `
id: 70791313
data:
  jaName: "王立魔法図書館"
  type: "monster"
  frameType: "effect"
  attribute: "LIGHT"
  race: "Spellcaster"
  level: 4

effect-additional-rules:
  continuous:
    - category: "TriggerRule"
      triggers: ["spellActivated"]
      triggerTiming: "if"
      isMandatory: true
      resolutions:
        - step: "PLACE_COUNTER"
          args: { counterType: "spell", count: 1, limit: 3 }

effect-chainable-actions:
  ignitions:
    - conditions:
        - step: "HAS_COUNTER"
          args: { counterType: "spell", minCount: 3 }
      activations:
        - step: "REMOVE_COUNTER"
          args: { counterType: "spell", count: 3 }
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`;

/**
 * Royal Magical Library のゲーム状態を作成
 * - フィールド上にモンスターを配置
 * - カウンターを指定数置く
 */
const createRoyalMagicalLibraryGameState = (
  spellCounterCount: number,
  deckCount: number = 10,
): { state: GameSnapshot; instance: CardInstance } => {
  const CARD_ID = 70791313;
  const monsterInstance: CardInstance = {
    instanceId: `monster-${CARD_ID}`,
    id: CARD_ID,
    jaName: "王立魔法図書館",
    type: "monster",
    frameType: "effect",
    location: "mainMonsterZone",
    stateOnField: {
      position: "faceUp",
      battlePosition: "attack",
      placedThisTurn: false,
      counters: spellCounterCount > 0 ? [{ type: "spell", count: spellCounterCount }] : [],
      activatedEffects: new Set<string>(),
    },
  };

  const deckCards = Array(deckCount)
    .fill(null)
    .map((_, i) => ({
      instanceId: `deck-card-${i}`,
      id: i + 1000,
      jaName: `デッキカード${i}`,
      type: "monster" as const,
      frameType: "normal" as const,
      location: "mainDeck" as const,
    }));

  const state: GameSnapshot = {
    phase: "main1",
    turn: 1,
    lp: { player: 8000, opponent: 8000 },
    space: {
      mainDeck: deckCards,
      hand: [],
      extraDeck: [],
      mainMonsterZone: [monsterInstance],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };

  return { state, instance: monsterInstance };
};

describe("DSLEquivalence - Royal Magical Library (Continuous Effect)", () => {
  const CARD_ID = 70791313;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
    AdditionalRuleRegistry.clear();
  });

  it("TriggerRule カテゴリとして登録される", () => {
    loadCardFromYaml(ROYAL_MAGICAL_LIBRARY_YAML);
    const dslRules = AdditionalRuleRegistry.get(CARD_ID);
    const classRule = new RoyalMagicalLibraryContinuousEffect();

    expect(dslRules.length).toBe(1);
    expect(dslRules[0].category).toBe(classRule.category);
    expect(dslRules[0].category).toBe("TriggerRule");
  });

  it("triggers が spellActivated を含む", () => {
    loadCardFromYaml(ROYAL_MAGICAL_LIBRARY_YAML);
    const dslRules = AdditionalRuleRegistry.get(CARD_ID);
    const classRule = new RoyalMagicalLibraryContinuousEffect();

    expect(dslRules[0].triggers).toContain("spellActivated");
    expect(classRule.triggers).toContain("spellActivated");
  });

  it("canApply がフィールド上にカードがある場合 true を返す", () => {
    loadCardFromYaml(ROYAL_MAGICAL_LIBRARY_YAML);
    const dslRules = AdditionalRuleRegistry.get(CARD_ID);
    const classRule = new RoyalMagicalLibraryContinuousEffect();
    const { state } = createRoyalMagicalLibraryGameState(0);

    expect(dslRules[0].canApply(state)).toBe(classRule.canApply(state));
    expect(dslRules[0].canApply(state)).toBe(true);
  });

  it("createTriggerSteps がカウンター配置ステップを生成する", () => {
    loadCardFromYaml(ROYAL_MAGICAL_LIBRARY_YAML);
    const dslRules = AdditionalRuleRegistry.get(CARD_ID);
    const classRule = new RoyalMagicalLibraryContinuousEffect();
    const { state, instance } = createRoyalMagicalLibraryGameState(0);

    const dslSteps = dslRules[0].createTriggerSteps!(state, instance);
    const classSteps = classRule.createTriggerSteps!(state, instance);

    // counter ステップが両方に存在すること
    expect(dslSteps.some((s) => s.id.includes("counter"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("counter"))).toBe(true);
  });
});

describe("DSLEquivalence - Royal Magical Library (Ignition Effect)", () => {
  const CARD_ID = 70791313;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
    AdditionalRuleRegistry.clear();
  });

  it("起動効果が登録される", () => {
    loadCardFromYaml(ROYAL_MAGICAL_LIBRARY_YAML);
    const dslIgnitions = ChainableActionRegistry.getIgnitionEffects(CARD_ID);
    const classIgnition = new RoyalMagicalLibraryIgnitionEffect();

    expect(dslIgnitions.length).toBe(1);
    expect(dslIgnitions[0].spellSpeed).toBe(classIgnition.spellSpeed);
  });

  it("canActivate がカウンター3つ以上で true を返す", () => {
    loadCardFromYaml(ROYAL_MAGICAL_LIBRARY_YAML);
    const dslIgnitions = ChainableActionRegistry.getIgnitionEffects(CARD_ID);
    const classIgnition = new RoyalMagicalLibraryIgnitionEffect();
    const { state, instance } = createRoyalMagicalLibraryGameState(3);

    const dslResult = dslIgnitions[0].canActivate(state, instance);
    const classResult = classIgnition.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(true);
  });

  it("canActivate がカウンター不足で false を返す", () => {
    loadCardFromYaml(ROYAL_MAGICAL_LIBRARY_YAML);
    const dslIgnitions = ChainableActionRegistry.getIgnitionEffects(CARD_ID);
    const classIgnition = new RoyalMagicalLibraryIgnitionEffect();
    const { state, instance } = createRoyalMagicalLibraryGameState(2);

    const dslResult = dslIgnitions[0].canActivate(state, instance);
    const classResult = classIgnition.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("createActivationSteps がカウンター削除ステップを生成する", () => {
    loadCardFromYaml(ROYAL_MAGICAL_LIBRARY_YAML);
    const dslIgnitions = ChainableActionRegistry.getIgnitionEffects(CARD_ID);
    const classIgnition = new RoyalMagicalLibraryIgnitionEffect();
    const { state, instance } = createRoyalMagicalLibraryGameState(3);

    const dslSteps = dslIgnitions[0].createActivationSteps(state, instance);
    const classSteps = classIgnition.createActivationSteps(state, instance);

    // counter 削除ステップが両方に存在すること（発動通知ステップの後）
    expect(dslSteps.some((s: { id: string }) => s.id.includes("counter"))).toBe(true);
    expect(classSteps.some((s: { id: string }) => s.id.includes("counter"))).toBe(true);
  });

  it("createResolutionSteps がドローステップを生成する", () => {
    loadCardFromYaml(ROYAL_MAGICAL_LIBRARY_YAML);
    const dslIgnitions = ChainableActionRegistry.getIgnitionEffects(CARD_ID);
    const classIgnition = new RoyalMagicalLibraryIgnitionEffect();
    const { state, instance } = createRoyalMagicalLibraryGameState(3);

    const dslSteps = dslIgnitions[0].createResolutionSteps(state, instance);
    const classSteps = classIgnition.createResolutionSteps(state, instance);

    // draw ステップが両方に存在すること
    expect(dslSteps.some((s: { id: string }) => s.id.includes("draw"))).toBe(true);
    expect(classSteps.some((s: { id: string }) => s.id.includes("draw"))).toBe(true);
  });
});

// =============================================================================
// Phase 6: 追加スペルカードの等価性テスト
// =============================================================================

const INTO_THE_VOID_YAML = `
id: 93946239
data:
  jaName: "無の煉獄"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "HAND_COUNT"
        args: { minCount: 3 }
      - step: "CAN_DRAW"
        args: { count: 1 }
    resolutions:
      - step: "DRAW"
        args: { count: 1 }
      - step: "DISCARD_ALL_HAND_END_PHASE"
`;

const CARD_OF_DEMISE_YAML = `
id: 59750328
data:
  jaName: "命削りの宝札"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "ONCE_PER_TURN"
    resolutions:
      - step: "FILL_HANDS"
        args: { count: 3 }
      - step: "DISCARD_ALL_HAND_END_PHASE"
`;

const DARK_FACTORY_YAML = `
id: 90928333
data:
  jaName: "闇の量産工場"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "GRAVEYARD_HAS_MONSTER"
        args: { minCount: 2, frameType: "normal" }
    resolutions:
      - step: "SALVAGE_FROM_GRAVEYARD"
        args: { filterType: "monster", filterFrameType: "normal", count: 2 }
`;

/**
 * Into the Void のゲーム状態を作成
 * - 手札が3枚以上必要
 * - デッキに1枚以上必要
 */
const createIntoTheVoidGameState = (handCount: number, deckCount: number): GameSnapshot => {
  const handCards = Array(handCount)
    .fill(null)
    .map((_, i) => ({
      instanceId: `hand-card-${i}`,
      id: i + 100,
      jaName: `手札カード${i}`,
      type: "monster" as const,
      frameType: "normal" as const,
      location: "hand" as const,
    }));

  const deckCards = Array(deckCount)
    .fill(null)
    .map((_, i) => ({
      instanceId: `deck-card-${i}`,
      id: i + 200,
      jaName: `デッキカード${i}`,
      type: "monster" as const,
      frameType: "normal" as const,
      location: "mainDeck" as const,
    }));

  return {
    phase: "main1",
    turn: 1,
    lp: { player: 8000, opponent: 8000 },
    space: {
      mainDeck: deckCards,
      hand: handCards,
      extraDeck: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };
};

/**
 * Card of Demise のゲーム状態を作成
 * - 1ターンに1度制限
 */
const createCardOfDemiseGameState = (alreadyActivated: boolean): GameSnapshot => {
  const deckCards = Array(10)
    .fill(null)
    .map((_, i) => ({
      instanceId: `deck-card-${i}`,
      id: i + 100,
      jaName: `デッキカード${i}`,
      type: "monster" as const,
      frameType: "normal" as const,
      location: "mainDeck" as const,
    }));

  return {
    phase: "main1",
    turn: 1,
    lp: { player: 8000, opponent: 8000 },
    space: {
      mainDeck: deckCards,
      hand: [],
      extraDeck: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: alreadyActivated ? new Set<number>([59750328]) : new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };
};

/**
 * Dark Factory のゲーム状態を作成
 * - 墓地に通常モンスターが必要
 */
const createDarkFactoryGameState = (normalMonsterCountInGraveyard: number): GameSnapshot => {
  const graveyardMonsters = Array(normalMonsterCountInGraveyard)
    .fill(null)
    .map((_, i) => ({
      instanceId: `graveyard-monster-${i}`,
      id: i + 100,
      jaName: `通常モンスター${i}`,
      type: "monster" as const,
      frameType: "normal" as const,
      location: "graveyard" as const,
    }));

  return {
    phase: "main1",
    turn: 1,
    lp: { player: 8000, opponent: 8000 },
    space: {
      mainDeck: [],
      hand: [],
      extraDeck: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: graveyardMonsters,
      banished: [],
    },
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };
};

describe("DSLEquivalence - Into the Void", () => {
  const CARD_ID = 93946239;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
  });

  it("spellSpeed が一致する", () => {
    loadCardFromYaml(INTO_THE_VOID_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new IntoTheVoidActivation();

    expect(dslActivation).toBeDefined();
    expect(dslActivation!.spellSpeed).toBe(classActivation.spellSpeed);
  });

  it("canActivate が同一条件で同じ結果を返す（条件成立）", () => {
    loadCardFromYaml(INTO_THE_VOID_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new IntoTheVoidActivation();
    const state = createIntoTheVoidGameState(3, 1); // 手札3枚、デッキ1枚
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(true);
  });

  it("canActivate が同一条件で同じ結果を返す（手札不足）", () => {
    loadCardFromYaml(INTO_THE_VOID_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new IntoTheVoidActivation();
    const state = createIntoTheVoidGameState(2, 1); // 手札2枚（不足）
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("canActivate が同一条件で同じ結果を返す（デッキ不足）", () => {
    loadCardFromYaml(INTO_THE_VOID_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new IntoTheVoidActivation();
    const state = createIntoTheVoidGameState(3, 0); // デッキ0枚
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("createResolutionSteps がドローとエンドフェイズ捨てステップを生成する", () => {
    loadCardFromYaml(INTO_THE_VOID_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new IntoTheVoidActivation();
    const state = createIntoTheVoidGameState(3, 1);
    const instance = createMockCardInstance(CARD_ID);

    const dslSteps = dslActivation!.createResolutionSteps(state, instance);
    const classSteps = classActivation.createResolutionSteps(state, instance);

    // draw-1 ステップが両方に存在
    expect(dslSteps.some((s) => s.id === "draw-1")).toBe(true);
    expect(classSteps.some((s) => s.id === "draw-1")).toBe(true);

    // end-phase 関連ステップが両方に存在
    expect(dslSteps.some((s) => s.id.includes("end-phase"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("end-phase"))).toBe(true);
  });
});

describe("DSLEquivalence - Card of Demise", () => {
  const CARD_ID = 59750328;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
  });

  it("spellSpeed が一致する", () => {
    loadCardFromYaml(CARD_OF_DEMISE_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new CardOfDemiseActivation();

    expect(dslActivation).toBeDefined();
    expect(dslActivation!.spellSpeed).toBe(classActivation.spellSpeed);
  });

  it("canActivate が同一条件で同じ結果を返す（条件成立）", () => {
    loadCardFromYaml(CARD_OF_DEMISE_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new CardOfDemiseActivation();
    const state = createCardOfDemiseGameState(false); // まだ発動していない
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(true);
  });

  it("canActivate が同一条件で同じ結果を返す（既に発動済み）", () => {
    loadCardFromYaml(CARD_OF_DEMISE_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new CardOfDemiseActivation();
    const state = createCardOfDemiseGameState(true); // 既に発動済み
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("createResolutionSteps がFILL_HANDSとエンドフェイズ捨てステップを生成する", () => {
    loadCardFromYaml(CARD_OF_DEMISE_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new CardOfDemiseActivation();
    const state = createCardOfDemiseGameState(false);
    const instance = createMockCardInstance(CARD_ID);

    const dslSteps = dslActivation!.createResolutionSteps(state, instance);
    const classSteps = classActivation.createResolutionSteps(state, instance);

    // fill-hands ステップが両方に存在
    expect(dslSteps.some((s) => s.id.includes("fill-hands"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("fill-hands"))).toBe(true);

    // end-phase 関連ステップが両方に存在
    expect(dslSteps.some((s) => s.id.includes("end-phase"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("end-phase"))).toBe(true);
  });
});

describe("DSLEquivalence - Dark Factory of Mass Production", () => {
  const CARD_ID = 90928333;

  beforeEach(() => {
    CardDataRegistry.clear();
    ChainableActionRegistry.clear();
  });

  it("spellSpeed が一致する", () => {
    loadCardFromYaml(DARK_FACTORY_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new DarkFactoryActivation();

    expect(dslActivation).toBeDefined();
    expect(dslActivation!.spellSpeed).toBe(classActivation.spellSpeed);
  });

  it("canActivate が同一条件で同じ結果を返す（条件成立）", () => {
    loadCardFromYaml(DARK_FACTORY_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new DarkFactoryActivation();
    const state = createDarkFactoryGameState(2); // 通常モンスター2枚
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(true);
  });

  it("canActivate が同一条件で同じ結果を返す（通常モンスター不足）", () => {
    loadCardFromYaml(DARK_FACTORY_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new DarkFactoryActivation();
    const state = createDarkFactoryGameState(1); // 通常モンスター1枚（不足）
    const instance = createMockCardInstance(CARD_ID);

    const dslResult = dslActivation!.canActivate(state, instance);
    const classResult = classActivation.canActivate(state, instance);

    expect(dslResult.isValid).toBe(classResult.isValid);
    expect(dslResult.isValid).toBe(false);
  });

  it("createResolutionSteps がサルベージステップを生成する", () => {
    loadCardFromYaml(DARK_FACTORY_YAML);
    const dslActivation = ChainableActionRegistry.getActivation(CARD_ID);
    const classActivation = new DarkFactoryActivation();
    const state = createDarkFactoryGameState(2);
    const instance = createMockCardInstance(CARD_ID);

    const dslSteps = dslActivation!.createResolutionSteps(state, instance);
    const classSteps = classActivation.createResolutionSteps(state, instance);

    // salvage ステップが両方に存在
    expect(dslSteps.some((s) => s.id.includes("salvage"))).toBe(true);
    expect(classSteps.some((s) => s.id.includes("salvage") || s.id.includes("search"))).toBe(true);
  });
});
