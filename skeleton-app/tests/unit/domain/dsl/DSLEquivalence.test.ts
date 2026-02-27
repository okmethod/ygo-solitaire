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
