/**
 * GenericQuickPlaySpellActivation のテスト
 *
 * DSL定義から速攻魔法効果を生成するファクトリクラスの動作を検証する。
 *
 * TEST STRATEGY:
 * - DSL定義から正しくインスタンスが生成されること
 * - 条件チェックが正しく機能すること（速攻魔法制限 + 個別条件）
 * - 発動ステップと効果解決ステップが正しく生成されること
 * - 効果解決後に墓地送りステップが含まれること
 */

import { describe, it, expect } from "vitest";
import {
  GenericQuickPlaySpellActivation,
  createGenericQuickPlaySpellActivation,
} from "$lib/domain/dsl/factories/GenericQuickPlaySpellActivation";
import type { ChainableActionDSL } from "$lib/domain/dsl/types";
import {
  TEST_CARD_IDS,
  createSpellInstance,
  createSpellOnField,
  createMockGameState,
  createFilledMainDeck,
} from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const TEST_CARD_ID = TEST_CARD_IDS.SPELL_QUICK;

const quickPlayFromHand = () =>
  createSpellInstance("quick-play-test-instance", { cardId: TEST_CARD_ID, spellType: "quick-play" });

const quickPlaySetThisTurn = () =>
  createSpellOnField("quick-play-set-instance", {
    cardId: TEST_CARD_ID,
    spellType: "quick-play",
    position: "faceDown",
    placedThisTurn: true,
  });

const createState = (deckCount: number) =>
  createMockGameState({
    space: { ...createFilledMainDeck(deckCount, TEST_CARD_IDS.DUMMY) },
    phase: "main1",
  });

// =============================================================================
// インスタンス生成テスト
// =============================================================================

describe("GenericQuickPlaySpellActivation - インスタンス生成", () => {
  it("createGenericQuickPlaySpellActivation でインスタンスを生成できる", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, dsl);

    expect(activation).toBeInstanceOf(GenericQuickPlaySpellActivation);
    expect(activation.cardId).toBe(TEST_CARD_ID);
  });

  it("effectId は 'activation-{cardId}' の形式で生成される", () => {
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, {});

    expect(activation.effectId).toBe(`activation-${TEST_CARD_ID}`);
  });

  it("effectCategory は 'activation'", () => {
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, {});

    expect(activation.effectCategory).toBe("activation");
  });

  it("spellSpeed は 2（速攻魔法）", () => {
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, {});

    expect(activation.spellSpeed).toBe(2);
  });

  it("空のDSL定義でもインスタンスを生成できる", () => {
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, {});

    expect(activation).toBeInstanceOf(GenericQuickPlaySpellActivation);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("GenericQuickPlaySpellActivation - 条件チェック", () => {
  it("手札から発動する場合は canActivate が true を返す", () => {
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, {});

    const result = activation.canActivate(createState(5), quickPlayFromHand());

    expect(result.isValid).toBe(true);
  });

  it("セットしたターンのカードは canActivate が false を返す（速攻魔法制限）", () => {
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, {});

    const result = activation.canActivate(createState(5), quickPlaySetThisTurn());

    expect(result.isValid).toBe(false);
  });

  it("個別条件を満たす場合は canActivate が true を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 2 } }] },
      resolutions: [{ step: "DRAW", args: { count: 2 } }],
    };
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, dsl);

    const result = activation.canActivate(createState(5), quickPlayFromHand());

    expect(result.isValid).toBe(true);
  });

  it("個別条件を満たさない場合は canActivate が false を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 10 } }] },
    };
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, dsl);

    const result = activation.canActivate(createState(2), quickPlayFromHand()); // デッキ2枚（10枚必要）

    expect(result.isValid).toBe(false);
  });

  it("条件が定義されていない場合は手札からなら canActivate が true を返す", () => {
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, {});

    const result = activation.canActivate(createState(0), quickPlayFromHand());

    expect(result.isValid).toBe(true);
  });

  it("複数の条件のうち1つでも満たさない場合は canActivate が false を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        requirements: [
          { step: "CAN_DRAW", args: { count: 1 } },
          { step: "CAN_DRAW", args: { count: 10 } }, // 満たさない
        ],
      },
    };
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, dsl);

    const result = activation.canActivate(createState(5), quickPlayFromHand());

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("GenericQuickPlaySpellActivation - ステップ生成", () => {
  it("createActivationSteps に発動通知ステップが含まれる", () => {
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, {});

    const steps = activation.createActivationSteps(createState(5), quickPlayFromHand());

    expect(steps.length).toBeGreaterThanOrEqual(1);
    expect(steps[0].id).toContain("activation-notification");
  });

  it("activations が定義されている場合は発動ステップに含まれる", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "SELECT_AND_DISCARD", args: { count: 1 } }],
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, dsl);

    const steps = activation.createActivationSteps(createState(5), quickPlayFromHand());

    expect(steps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
  });

  it("activations が定義されていない場合は個別ステップは空", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, dsl);

    const steps = activation.createActivationSteps(createState(5), quickPlayFromHand());

    expect(steps.filter((s) => s.id.includes("select")).length).toBe(0);
  });

  it("createResolutionSteps で効果解決ステップを生成できる", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [
        { step: "DRAW", args: { count: 2 } },
        { step: "THEN" },
        { step: "SELECT_AND_DISCARD", args: { count: 1 } },
      ],
    };
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, dsl);

    const steps = activation.createResolutionSteps(createState(5), quickPlayFromHand());

    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].id).toBe("draw-2");
    expect(steps[1].id).toBe("then-marker");
    expect(steps[2].id).toBe("select-and-discard-1-any-cards");
  });

  it("createResolutionSteps の末尾に墓地送りステップが含まれる（速攻魔法は使用後墓地へ）", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, dsl);

    const steps = activation.createResolutionSteps(createState(5), quickPlayFromHand());

    const lastStep = steps[steps.length - 1];
    expect(lastStep.id).toContain("to-graveyard");
  });

  it("resolutions が空でも墓地送りステップは含まれる", () => {
    const activation = createGenericQuickPlaySpellActivation(TEST_CARD_ID, {});

    const steps = activation.createResolutionSteps(createState(5), quickPlayFromHand());

    expect(steps.length).toBeGreaterThanOrEqual(1);
    expect(steps[steps.length - 1].id).toContain("to-graveyard");
  });
});
