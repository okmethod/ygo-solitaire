/**
 * GenericTriggerEffect のテスト
 *
 * DSL定義から誘発効果を生成するファクトリクラスの動作を検証する。
 *
 * TEST STRATEGY:
 * - DSL定義から正しくプロパティが設定されること
 * - 条件チェックが正しく機能すること
 * - 発動ステップと効果解決ステップが正しく生成されること
 */

import { describe, it, expect } from "vitest";
import { GenericTriggerEffect, createGenericTriggerEffect } from "$lib/domain/dsl/factories/GenericTriggerEffect";
import type { ChainableActionDSL } from "$lib/domain/dsl/types";
import {
  DUMMY_CARD_IDS,
  createMonsterOnField,
  createMockGameState,
  createFilledMainDeck,
  createHand,
} from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const EFFECT_MONSTER_ID = DUMMY_CARD_IDS.EFFECT_MONSTER;
const OTHER_CARD_ID = DUMMY_CARD_IDS.NORMAL_MONSTER;

const monsterOnField = () => createMonsterOnField("trigger-test-instance", { cardId: EFFECT_MONSTER_ID });

/** デッキ枚数と手札枚数を指定してゲーム状態を生成 */
const createState = (deckCount: number, handCount: number = 0) =>
  createMockGameState({
    space: {
      ...createFilledMainDeck(deckCount, OTHER_CARD_ID),
      ...createHand(Array(handCount).fill(OTHER_CARD_ID)),
    },
    phase: "main1",
  });

// =============================================================================
// インスタンス生成テスト
// =============================================================================

describe("GenericTriggerEffect - インスタンス生成", () => {
  it("createGenericTriggerEffect でインスタンスを生成できる", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: {
          events: ["normalSummoned"],
          timing: "when",
          isMandatory: false,
          selfOnly: true,
        },
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);

    expect(effect).toBeInstanceOf(GenericTriggerEffect);
    expect(effect.cardId).toBe(EFFECT_MONSTER_ID);
    expect(effect.effectId).toBe(`trigger-${EFFECT_MONSTER_ID}-1`);
  });

  it("DSL定義からトリガープロパティを正しく読み取る", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: {
          events: ["normalSummoned", "synchroSummoned"],
          timing: "when",
          isMandatory: false,
          selfOnly: true,
          excludeSelf: false,
        },
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);

    expect(effect.triggers).toEqual(["normalSummoned", "synchroSummoned"]);
    expect(effect.triggerTiming).toBe("when");
    expect(effect.isMandatory).toBe(false);
    expect(effect.selfOnly).toBe(true);
    expect(effect.excludeSelf).toBe(false);
  });

  it("デフォルト値が正しく設定される", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: {
          events: ["cardDestroyed"],
        },
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);

    expect(effect.triggers).toEqual(["cardDestroyed"]);
    expect(effect.triggerTiming).toBe("if"); // デフォルト
    expect(effect.isMandatory).toBe(true); // デフォルト
    expect(effect.selfOnly).toBe(false); // デフォルト
    expect(effect.excludeSelf).toBe(false); // デフォルト
  });

  it("空のDSL定義でもインスタンスを生成できる", () => {
    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, {});

    expect(effect).toBeInstanceOf(GenericTriggerEffect);
    expect(effect.triggers).toEqual([]);
    expect(effect.triggerTiming).toBe("if");
    expect(effect.isMandatory).toBe(true);
  });

  it("spellSpeed を DSL定義から取得できる", () => {
    const dsl: ChainableActionDSL = {
      spellSpeed: 2, // 誘発即時効果
      conditions: {
        trigger: {
          events: ["spellActivated"],
        },
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);

    expect(effect.spellSpeed).toBe(2);
  });

  it("spellSpeed のデフォルト値は 1", () => {
    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, {});

    expect(effect.spellSpeed).toBe(1);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("GenericTriggerEffect - 条件チェック", () => {
  it("条件を満たす場合は canActivate が true を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
        requirements: [{ step: "CAN_DRAW", args: { count: 2 } }],
      },
      resolutions: [{ step: "DRAW", args: { count: 2 } }],
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const result = effect.canActivate(createState(5), monsterOnField()); // デッキ5枚

    expect(result.isValid).toBe(true);
  });

  it("条件を満たさない場合は canActivate が false を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
        requirements: [{ step: "CAN_DRAW", args: { count: 10 } }],
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const result = effect.canActivate(createState(3), monsterOnField()); // デッキ3枚（10枚必要）

    expect(result.isValid).toBe(false);
  });

  it("複数の条件がすべて満たされる場合は canActivate が true を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
        requirements: [
          { step: "CAN_DRAW", args: { count: 1 } },
          { step: "CAN_DRAW", args: { count: 2 } },
        ],
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const result = effect.canActivate(createState(5), monsterOnField());

    expect(result.isValid).toBe(true);
  });

  it("複数の条件のうち1つでも満たさない場合は canActivate が false を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
        requirements: [
          { step: "CAN_DRAW", args: { count: 1 } },
          { step: "CAN_DRAW", args: { count: 10 } }, // 満たさない
        ],
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const result = effect.canActivate(createState(5), monsterOnField());

    expect(result.isValid).toBe(false);
  });

  it("条件が定義されていない場合は常に canActivate が true を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
      },
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const result = effect.canActivate(createState(0), monsterOnField()); // デッキ0枚でも条件なしなのでOK

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("GenericTriggerEffect - ステップ生成", () => {
  it("createResolutionSteps で効果解決ステップを生成できる", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
      },
      resolutions: [
        { step: "DRAW", args: { count: 2 } },
        { step: "THEN" },
        { step: "SELECT_AND_DISCARD", args: { count: 1 } },
      ],
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const steps = effect.createResolutionSteps(createState(5), monsterOnField());

    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].id).toBe("draw-2");
    expect(steps[1].id).toBe("then-marker");
    expect(steps[2].id).toBe("select-and-discard-1-any-cards");
  });

  it("createActivationSteps で発動ステップを生成できる", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
      },
      activations: [{ step: "SELECT_AND_DISCARD", args: { count: 1 } }],
      resolutions: [{ step: "DRAW", args: { count: 2 } }],
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const steps = effect.createActivationSteps(createState(5), monsterOnField());

    expect(steps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
  });

  it("activations が定義されていない場合は基底クラスのステップのみ返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
      },
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const steps = effect.createActivationSteps(createState(5), monsterOnField());

    // 誘発効果の発動ステップにはselect-and-discardは含まれない
    expect(steps.filter((s) => s.id.includes("select-and-discard")).length).toBe(0);
  });

  it("resolutions が定義されていない場合は基底クラスのステップのみ返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const steps = effect.createResolutionSteps(createState(5), monsterOnField());

    // カード固有の効果解決ステップはない
    expect(steps.filter((s) => s.id.includes("draw")).length).toBe(0);
  });
});

// =============================================================================
// 効果カテゴリ・基底クラステスト
// =============================================================================

describe("GenericTriggerEffect - 基底クラス継承", () => {
  it("effectCategory は 'trigger' を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);

    expect(effect.effectCategory).toBe("trigger");
  });

  it("effectId は正しい形式で生成される", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
      },
    };

    const effect = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);

    expect(effect.effectId).toBe(`trigger-${EFFECT_MONSTER_ID}-1`);
  });

  it("effectIndex が異なれば effectId も異なる", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        trigger: { events: ["normalSummoned"] },
      },
    };

    const effect1 = createGenericTriggerEffect(EFFECT_MONSTER_ID, 1, dsl);
    const effect2 = createGenericTriggerEffect(EFFECT_MONSTER_ID, 2, dsl);

    expect(effect1.effectId).not.toBe(effect2.effectId);
    expect(effect1.effectId).toBe(`trigger-${EFFECT_MONSTER_ID}-1`);
    expect(effect2.effectId).toBe(`trigger-${EFFECT_MONSTER_ID}-2`);
  });
});
