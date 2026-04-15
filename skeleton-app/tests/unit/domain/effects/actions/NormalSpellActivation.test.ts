/**
 * 通常魔法発動の抽象クラスのテスト
 *
 * createNoOp で生成される効果無しインスタンスにより動作検証する。
 */

import { describe, it, expect } from "vitest";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import { createPhaseState, DUMMY_CARD_IDS, createSpellInstance } from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const normalSpellActivation = NormalSpellActivation.createNoOp(DUMMY_CARD_IDS.NORMAL_SPELL);
const sourceInstance = createSpellInstance("normal-1", { cardId: DUMMY_CARD_IDS.NORMAL_SPELL });

// =============================================================================
// createNoOp テスト
// =============================================================================

describe("NormalSpellActivation.createNoOp", () => {
  it("createNoOp でインスタンスを生成できる", () => {
    expect(normalSpellActivation).toBeInstanceOf(NormalSpellActivation);
    expect(normalSpellActivation.cardId).toBe(DUMMY_CARD_IDS.NORMAL_SPELL);
  });

  it("NoOp の spellSpeed は 1 である", () => {
    expect(normalSpellActivation.spellSpeed).toBe(1);
  });

  it("NoOp の effectCategory は 'activation' である", () => {
    expect(normalSpellActivation.effectCategory).toBe("activation");
  });

  it("NoOp はメインフェイズで発動可能", () => {
    const state = createPhaseState("main1");

    const result = normalSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("NormalSpellActivation - subTypeConditions", () => {
  it("メインフェイズ1で発動可能", () => {
    const state = createPhaseState("main1");

    const result = normalSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });

  it("ドローフェイズでは発動不可", () => {
    const state = createPhaseState("draw");

    const result = normalSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("スタンバイフェイズでは発動不可", () => {
    const state = createPhaseState("standby");

    const result = normalSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("エンドフェイズでは発動不可", () => {
    const state = createPhaseState("end");

    const result = normalSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("NormalSpellActivation - ステップ生成", () => {
  it("createActivationSteps で発動通知ステップとイベントステップを生成する", () => {
    const state = createPhaseState("main1");

    const steps = normalSpellActivation.createActivationSteps(state, sourceInstance);

    expect(steps).toHaveLength(2);
    expect(steps[0].id).toBe(`${DUMMY_CARD_IDS.NORMAL_SPELL}-activation-notification`);
    expect(steps[0].summary).toBe("カード発動");
    expect(steps[1].id).toBe("emit-spell-activated-normal-1");
  });

  it("createResolutionSteps で墓地送りステップを生成する（通常魔法は効果解決後に墓地へ）", () => {
    const state = createPhaseState("main1");

    const steps = normalSpellActivation.createResolutionSteps(state, sourceInstance);

    expect(steps).toHaveLength(1);
    expect(steps[0].id).toBe("send-normal-1-to-graveyard");
  });
});
