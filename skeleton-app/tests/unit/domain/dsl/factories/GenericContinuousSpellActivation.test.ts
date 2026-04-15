/**
 * DSL定義から永続魔法効果を生成するファクトリクラスのテスト
 *
 * TEST STRATEGY:
 * - DSL定義から正しくインスタンスが生成されること
 * - 条件チェックが正しく機能すること（メインフェイズ制限 + 個別条件）
 * - 発動ステップと効果解決ステップが正しく生成されること
 * - 効果解決後に墓地送りステップがないこと（フィールドに残る）
 */

import { describe, it, expect } from "vitest";
import {
  GenericContinuousSpellActivation,
  createGenericContinuousSpellActivation,
} from "$lib/domain/dsl/factories/GenericContinuousSpellActivation";
import type { ChainableActionDSL } from "$lib/domain/dsl/types";
import { createSpellInstance, createSpaceState, createFilledMainDeck, DUMMY_CARD_IDS } from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const CONTINUOUS_SPELL_ID = DUMMY_CARD_IDS.CONTINUOUS_SPELL;

const continuousSpellInstance = () =>
  createSpellInstance("continuous-spell-test-instance", {
    cardId: CONTINUOUS_SPELL_ID,
    spellType: "continuous",
  });

const stateByPhase = (phase: "main1" | "standby" | "end" = "main1") =>
  createSpaceState(
    {
      ...createFilledMainDeck(5),
    },
    phase,
  );

const baseDsl = (): ChainableActionDSL => ({
  resolutions: [{ step: "DRAW", args: { count: 1 } }],
});

// =============================================================================
// インスタンス生成テスト
// =============================================================================

describe("GenericContinuousSpellActivation - インスタンス生成", () => {
  it("createGenericContinuousSpellActivation でインスタンスを生成できる", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, baseDsl());

    expect(activation).toBeInstanceOf(GenericContinuousSpellActivation);
    expect(activation.cardId).toBe(CONTINUOUS_SPELL_ID);
  });

  it("effectId は 'activation-{cardId}' の形式で生成される", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    expect(activation.effectId).toBe(`activation-${CONTINUOUS_SPELL_ID}`);
  });

  it("effectCategory は 'activation'", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    expect(activation.effectCategory).toBe("activation");
  });

  it("spellSpeed は 1（永続魔法）", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    expect(activation.spellSpeed).toBe(1);
  });

  it("空のDSL定義でもインスタンスを生成できる", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    expect(activation).toBeInstanceOf(GenericContinuousSpellActivation);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("GenericContinuousSpellActivation - 条件チェック", () => {
  it("メインフェイズ1では canActivate が true を返す", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    const result = activation.canActivate(stateByPhase(), continuousSpellInstance());

    expect(result.isValid).toBe(true);
  });

  it("メインフェイズ以外では canActivate が false を返す（メインフェイズ制限）", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    const result = activation.canActivate(stateByPhase("standby"), continuousSpellInstance());

    expect(result.isValid).toBe(false);
  });

  it("個別条件を満たす場合は canActivate が true を返す", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {
      ...baseDsl(),
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 2 } }] },
    });

    const result = activation.canActivate(stateByPhase(), continuousSpellInstance());

    expect(result.isValid).toBe(true);
  });

  it("個別条件を満たさない場合は canActivate が false を返す", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {
      ...baseDsl(),
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 10 } }] },
    });

    const result = activation.canActivate(stateByPhase(), continuousSpellInstance()); // デッキ不足

    expect(result.isValid).toBe(false);
  });

  it("条件が定義されていない場合はメインフェイズなら canActivate が true を返す", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    const result = activation.canActivate(stateByPhase(), continuousSpellInstance());

    expect(result.isValid).toBe(true);
  });

  it("複数の条件のうち1つでも満たさない場合は canActivate が false を返す", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {
      ...baseDsl(),
      conditions: {
        requirements: [
          { step: "CAN_DRAW", args: { count: 1 } },
          { step: "CAN_DRAW", args: { count: 10 } }, // 満たさない
        ],
      },
    });

    const result = activation.canActivate(stateByPhase(), continuousSpellInstance());

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("GenericContinuousSpellActivation - ステップ生成", () => {
  it("createActivationSteps に発動通知ステップが含まれる", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    const steps = activation.createActivationSteps(stateByPhase(), continuousSpellInstance());

    expect(steps.length).toBeGreaterThanOrEqual(1);
    expect(steps[0].id).toContain("activation-notification");
  });

  it("activations が定義されている場合は発動ステップに含まれる", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {
      ...baseDsl(),
      activations: [{ step: "SELECT_AND_DISCARD", args: { count: 1 } }],
    });

    const steps = activation.createActivationSteps(stateByPhase(), continuousSpellInstance());

    expect(steps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
  });

  it("activations が定義されていない場合は個別ステップは空", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    const steps = activation.createActivationSteps(stateByPhase(), continuousSpellInstance());

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
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, dsl);

    const steps = activation.createResolutionSteps(stateByPhase(), continuousSpellInstance());

    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].id).toBe("draw-2");
    expect(steps[1].id).toBe("then-marker");
    expect(steps[2].id).toBe("select-and-discard-1-any-cards");
  });

  it("resolutions が定義されていない場合は空の解決ステップを返す", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, {});

    const steps = activation.createResolutionSteps(stateByPhase(), continuousSpellInstance());

    expect(steps.length).toBe(0);
  });

  it("createResolutionSteps に墓地送りステップは含まれない（永続魔法はフィールドに残る）", () => {
    const activation = createGenericContinuousSpellActivation(CONTINUOUS_SPELL_ID, baseDsl());

    const steps = activation.createResolutionSteps(stateByPhase(), continuousSpellInstance());

    expect(steps.some((s) => s.id.includes("graveyard") || s.id.includes("send-to"))).toBe(false);
  });
});
