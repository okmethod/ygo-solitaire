/**
 * DSL定義から起動効果を生成するファクトリクラスのテスト
 *
 * TEST STRATEGY:
 * - DSL定義から正しくインスタンスが生成されること
 * - 条件チェックが正しく機能すること（メインフェイズ制限 + 個別条件）
 * - 発動ステップと効果解決ステップが正しく生成されること
 */

import { describe, it, expect } from "vitest";
import { GenericIgnitionEffect, createGenericIgnitionEffect } from "$lib/domain/dsl/factories/GenericIgnitionEffect";
import type { ChainableActionDSL } from "$lib/domain/dsl/types";
import {
  DUMMY_CARD_IDS,
  createMonsterOnField,
  createMockGameState,
  createFilledMainDeck,
} from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const EFFECT_MONSTER_ID = DUMMY_CARD_IDS.EFFECT_MONSTER;
const OTHER_CARD_ID = DUMMY_CARD_IDS.NORMAL_MONSTER;

const monsterOnField = () => createMonsterOnField("ignition-test-instance", { cardId: EFFECT_MONSTER_ID });

const createState = (deckCount: number, phase: "main1" | "standby" | "end" = "main1") =>
  createMockGameState({
    space: { ...createFilledMainDeck(deckCount, OTHER_CARD_ID) },
    phase,
  });

// =============================================================================
// インスタンス生成テスト
// =============================================================================

describe("GenericIgnitionEffect - インスタンス生成", () => {
  it("createGenericIgnitionEffect でインスタンスを生成できる", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    expect(effect).toBeInstanceOf(GenericIgnitionEffect);
    expect(effect.cardId).toBe(EFFECT_MONSTER_ID);
  });

  it("effectId は 'ignition-{cardId}-{effectIndex}' の形式で生成される", () => {
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, {});

    expect(effect.effectId).toBe(`ignition-${EFFECT_MONSTER_ID}-1`);
  });

  it("effectIndex が異なれば effectId も異なる", () => {
    const effect1 = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, {});
    const effect2 = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 2, {});

    expect(effect1.effectId).not.toBe(effect2.effectId);
    expect(effect1.effectId).toBe(`ignition-${EFFECT_MONSTER_ID}-1`);
    expect(effect2.effectId).toBe(`ignition-${EFFECT_MONSTER_ID}-2`);
  });

  it("effectCategory は 'ignition'", () => {
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, {});

    expect(effect.effectCategory).toBe("ignition");
  });

  it("spellSpeed は 1", () => {
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, {});

    expect(effect.spellSpeed).toBe(1);
  });

  it("空のDSL定義でもインスタンスを生成できる", () => {
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, {});

    expect(effect).toBeInstanceOf(GenericIgnitionEffect);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("GenericIgnitionEffect - 条件チェック", () => {
  it("メインフェイズ1では canActivate が true を返す", () => {
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, {});

    const result = effect.canActivate(createState(5, "main1"), monsterOnField());

    expect(result.isValid).toBe(true);
  });

  it("メインフェイズ以外では canActivate が false を返す", () => {
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, {});

    const result = effect.canActivate(createState(5, "standby"), monsterOnField());

    expect(result.isValid).toBe(false);
  });

  it("個別条件を満たす場合は canActivate が true を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 2 } }] },
      resolutions: [{ step: "DRAW", args: { count: 2 } }],
    };
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    const result = effect.canActivate(createState(5), monsterOnField()); // デッキ5枚

    expect(result.isValid).toBe(true);
  });

  it("個別条件を満たさない場合は canActivate が false を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 10 } }] },
    };
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    const result = effect.canActivate(createState(2), monsterOnField()); // デッキ2枚（10枚必要）

    expect(result.isValid).toBe(false);
  });

  it("条件が定義されていない場合はメインフェイズなら canActivate が true を返す", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    const result = effect.canActivate(createState(0), monsterOnField()); // デッキ0枚でも条件なしならOK

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
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    const result = effect.canActivate(createState(5), monsterOnField());

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("GenericIgnitionEffect - ステップ生成", () => {
  it("createActivationSteps に発動通知ステップが含まれる", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    const steps = effect.createActivationSteps(createState(5), monsterOnField());

    expect(steps.length).toBeGreaterThanOrEqual(1);
    expect(steps[0].id).toContain("activation-notification");
  });

  it("activations が定義されている場合は発動ステップに含まれる", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "SELECT_AND_DISCARD", args: { count: 1 } }],
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    const steps = effect.createActivationSteps(createState(5), monsterOnField());

    expect(steps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
  });

  it("activations が定義されていない場合は発動通知ステップのみ", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    const steps = effect.createActivationSteps(createState(5), monsterOnField());

    expect(steps.filter((s) => s.id.includes("select")).length).toBe(0);
    expect(steps[0].id).toContain("activation-notification");
  });

  it("createResolutionSteps で効果解決ステップを生成できる", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [
        { step: "DRAW", args: { count: 2 } },
        { step: "THEN" },
        { step: "SELECT_AND_DISCARD", args: { count: 1 } },
      ],
    };
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    const steps = effect.createResolutionSteps(createState(5), monsterOnField());

    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].id).toBe("draw-2");
    expect(steps[1].id).toBe("then-marker");
    expect(steps[2].id).toBe("select-and-discard-1-any-cards");
  });

  it("resolutions が定義されていない場合は空の解決ステップを返す", () => {
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, {});

    const steps = effect.createResolutionSteps(createState(5), monsterOnField());

    expect(steps.length).toBe(0);
  });

  it("createResolutionSteps に墓地送りステップは含まれない（モンスターはフィールドに残る）", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };
    const effect = createGenericIgnitionEffect(EFFECT_MONSTER_ID, 1, dsl);

    const steps = effect.createResolutionSteps(createState(5), monsterOnField());

    expect(steps.some((s) => s.id.includes("graveyard") || s.id.includes("send-to"))).toBe(false);
  });
});
