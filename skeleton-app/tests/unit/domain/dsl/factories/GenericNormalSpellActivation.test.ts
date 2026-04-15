/**
 * DSL定義から通常魔法効果を生成するファクトリクラスのテスト
 *
 * TEST STRATEGY:
 * - DSL定義から正しくAtomicStepが生成されること
 * - 条件チェックが正しく機能すること
 * - 発動ステップと効果解決ステップが正しく分離されていること
 */

import { describe, it, expect } from "vitest";
import {
  GenericNormalSpellActivation,
  createGenericNormalSpellActivation,
} from "$lib/domain/dsl/factories/GenericNormalSpellActivation";
import type { ChainableActionDSL } from "$lib/domain/dsl/types";
import { createSpellInstance, createSpaceState, createFilledMainDeck, DUMMY_CARD_IDS } from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const NORMAL_SPELL_ID = DUMMY_CARD_IDS.NORMAL_SPELL;
const OTHER_CARD_ID = DUMMY_CARD_IDS.NORMAL_MONSTER;

const normalSpellInstance = () =>
  createSpellInstance("test-instance-id", { cardId: NORMAL_SPELL_ID, spellType: "normal" });

const state = createSpaceState({
  ...createFilledMainDeck(5, OTHER_CARD_ID),
});

const baseDsl = (): ChainableActionDSL => ({
  resolutions: [{ step: "DRAW", args: { count: 1 } }],
});

// =============================================================================
// 生成テスト
// =============================================================================

describe("GenericNormalSpellActivation - インスタンス生成", () => {
  it("createGenericNormalSpellActivation でインスタンスを生成できる", () => {
    const dsl: ChainableActionDSL = {
      conditions: {
        requirements: [{ step: "CAN_DRAW", args: { count: 2 } }],
      },
      resolutions: [{ step: "DRAW", args: { count: 2 } }],
    };

    const activation = createGenericNormalSpellActivation(NORMAL_SPELL_ID, dsl);

    expect(activation).toBeInstanceOf(GenericNormalSpellActivation);
    expect(activation.cardId).toBe(NORMAL_SPELL_ID);
    expect(activation.spellSpeed).toBe(1);
  });

  it("空のDSL定義でもインスタンスを生成できる", () => {
    const activation = createGenericNormalSpellActivation(NORMAL_SPELL_ID, {});

    expect(activation).toBeInstanceOf(GenericNormalSpellActivation);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("GenericNormalSpellActivation - 条件チェック", () => {
  it("条件を満たす場合は canActivate が true を返す", () => {
    const activation = createGenericNormalSpellActivation(NORMAL_SPELL_ID, {
      ...baseDsl(),
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 2 } }] },
    });
    const result = activation.canActivate(state, normalSpellInstance());

    expect(result.isValid).toBe(true);
  });

  it("条件を満たさない場合は canActivate が false を返す", () => {
    const activation = createGenericNormalSpellActivation(NORMAL_SPELL_ID, {
      ...baseDsl(),
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 10 } }] },
    });
    const result = activation.canActivate(state, normalSpellInstance()); // デッキ不足

    expect(result.isValid).toBe(false);
  });

  it("条件が定義されていない場合は常に canActivate が true", () => {
    const activation = createGenericNormalSpellActivation(NORMAL_SPELL_ID, baseDsl());
    const result = activation.canActivate(state, normalSpellInstance());

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

    const activation = createGenericNormalSpellActivation(NORMAL_SPELL_ID, dsl);
    const steps = activation.createResolutionSteps(state, normalSpellInstance());

    // 基底クラスのsubTypePostResolutionSteps（墓地送り）も含まれる
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].id).toBe("draw-3");
    expect(steps[1].id).toBe("then-marker");
    expect(steps[2].id).toBe("select-and-discard-2-any-cards");
  });

  it("createActivationSteps で発動ステップを生成できる", () => {
    const activation = createGenericNormalSpellActivation(NORMAL_SPELL_ID, {
      ...baseDsl(),
      activations: [{ step: "SELECT_AND_DISCARD", args: { count: 1 } }],
    });
    const steps = activation.createActivationSteps(state, normalSpellInstance());

    // 発動ステップ（コスト支払い等）
    expect(steps.some((s) => s.id.includes("select-and-discard"))).toBe(true);
  });

  it("activations が定義されていない場合は空配列を返す", () => {
    const activation = createGenericNormalSpellActivation(NORMAL_SPELL_ID, baseDsl());
    const steps = activation.createActivationSteps(state, normalSpellInstance());

    // 基底クラスの共通ステップのみ（通常魔法は空）
    expect(steps.filter((s) => s.id.includes("select")).length).toBe(0);
  });
});
