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
