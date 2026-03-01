import { describe, it, expect, beforeEach } from "vitest";
import {
  GenericNormalSpellActivation,
  createGenericNormalSpellActivation,
} from "$lib/domain/dsl/factories/GenericNormalSpellActivation";
import type { ChainableActionDSL } from "$lib/domain/dsl/types";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot, CardSpace } from "$lib/domain/models/GameState";
import { CardDataRegistry } from "$lib/domain/cards";

/**
 * GenericNormalSpellActivation Tests
 *
 * TEST STRATEGY:
 * - DSL定義から正しくAtomicStepが生成されること
 * - 条件チェックが正しく機能すること
 * - 発動ステップと効果解決ステップが正しく分離されていること
 */

// =============================================================================
// テストセットアップ
// =============================================================================

const TEST_CARD_ID = 12345;

beforeEach(() => {
  CardDataRegistry.clear();
  // テスト用カードを登録
  CardDataRegistry.register(TEST_CARD_ID, {
    jaName: "テストカード",
    type: "spell",
    frameType: "spell",
    spellType: "normal",
  });
});

// =============================================================================
// テストヘルパー
// =============================================================================

const createMockCardInstance = (cardId: number): CardInstance => ({
  instanceId: "test-instance-id",
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
    phase: "main1", // GamePhase型（メインフェイズ1）
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
    } as CardSpace,
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };
};

// =============================================================================
// 生成テスト
// =============================================================================

describe("GenericNormalSpellActivation - インスタンス生成", () => {
  it("createGenericNormalSpellActivation でインスタンスを生成できる", () => {
    const dsl: ChainableActionDSL = {
      conditions: [{ step: "CAN_DRAW", args: { count: 2 } }],
      resolutions: [{ step: "DRAW", args: { count: 2 } }],
    };

    const activation = createGenericNormalSpellActivation(12345, dsl);

    expect(activation).toBeInstanceOf(GenericNormalSpellActivation);
    expect(activation.cardId).toBe(12345);
    expect(activation.spellSpeed).toBe(1);
  });

  it("空のDSL定義でもインスタンスを生成できる", () => {
    const dsl: ChainableActionDSL = {};

    const activation = createGenericNormalSpellActivation(12345, dsl);

    expect(activation).toBeInstanceOf(GenericNormalSpellActivation);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("GenericNormalSpellActivation - 条件チェック", () => {
  it("条件を満たす場合は canActivate が true を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: [{ step: "CAN_DRAW", args: { count: 2 } }],
      resolutions: [{ step: "DRAW", args: { count: 2 } }],
    };

    const activation = createGenericNormalSpellActivation(12345, dsl);
    const state = createMockGameState(5); // デッキ5枚
    const sourceInstance = createMockCardInstance(12345);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });

  it("条件を満たさない場合は canActivate が false を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: [{ step: "CAN_DRAW", args: { count: 3 } }],
      resolutions: [{ step: "DRAW", args: { count: 3 } }],
    };

    const activation = createGenericNormalSpellActivation(12345, dsl);
    const state = createMockGameState(2); // デッキ2枚（3枚必要）
    const sourceInstance = createMockCardInstance(12345);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
  });

  it("条件が定義されていない場合は常に canActivate が true", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const activation = createGenericNormalSpellActivation(12345, dsl);
    const state = createMockGameState(0); // デッキ0枚でも条件なしなのでOK
    const sourceInstance = createMockCardInstance(12345);

    // Note: メインフェイズのみ発動可能という基底クラスの条件があるため、
    // メインフェイズ1のstateを使用
    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("GenericNormalSpellActivation - ステップ生成", () => {
  it("createResolutionSteps で効果解決ステップを生成できる", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [
        { step: "DRAW", args: { count: 3 } },
        { step: "THEN" },
        { step: "SELECT_AND_DISCARD", args: { count: 2 } },
      ],
    };

    const activation = createGenericNormalSpellActivation(12345, dsl);
    const state = createMockGameState(5);
    const sourceInstance = createMockCardInstance(12345);

    const steps = activation.createResolutionSteps(state, sourceInstance);

    // 基底クラスのsubTypePostResolutionSteps（墓地送り）も含まれる
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].id).toBe("draw-3");
    expect(steps[1].id).toBe("then-marker");
    expect(steps[2].id).toBe("select-and-discard-2-cards");
  });

  it("createActivationSteps で発動ステップを生成できる", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "SELECT_AND_DISCARD", args: { count: 1 } }],
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const activation = createGenericNormalSpellActivation(12345, dsl);
    const state = createMockGameState(5);
    const sourceInstance = createMockCardInstance(12345);

    const steps = activation.createActivationSteps(state, sourceInstance);

    // 発動ステップ（コスト支払い等）
    expect(steps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
  });

  it("activations が定義されていない場合は空配列を返す", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const activation = createGenericNormalSpellActivation(12345, dsl);
    const state = createMockGameState(5);
    const sourceInstance = createMockCardInstance(12345);

    const steps = activation.createActivationSteps(state, sourceInstance);

    // 基底クラスの共通ステップのみ（通常魔法は空）
    expect(steps.filter((s) => s.id.includes("select")).length).toBe(0);
  });
});
