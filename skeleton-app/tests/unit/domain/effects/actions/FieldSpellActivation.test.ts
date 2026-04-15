/**
 * フィールド魔法発動の抽象クラスのテスト
 *
 * createNoOp で生成される効果無しインスタンスにより動作検証する。
 */

import { describe, it, expect } from "vitest";
import { FieldSpellActivation } from "$lib/domain/effects/actions/activations/FieldSpellActivation";
import { createPhaseState, createSpellInstance, DUMMY_CARD_IDS } from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const fieldSpellActivation = FieldSpellActivation.createNoOp(DUMMY_CARD_IDS.FIELD_SPELL);
const sourceInstance = createSpellInstance("field-1", { cardId: DUMMY_CARD_IDS.FIELD_SPELL, spellType: "field" });

// =============================================================================
// createNoOp テスト
// =============================================================================

describe("FieldSpellActivation.createNoOp", () => {
  it("createNoOp でインスタンスを生成できる", () => {
    expect(fieldSpellActivation).toBeInstanceOf(FieldSpellActivation);
    expect(fieldSpellActivation.cardId).toBe(DUMMY_CARD_IDS.FIELD_SPELL);
  });

  it("NoOp の spellSpeed は 1 である", () => {
    expect(fieldSpellActivation.spellSpeed).toBe(1);
  });

  it("NoOp の effectCategory は 'activation' である", () => {
    expect(fieldSpellActivation.effectCategory).toBe("activation");
  });

  it("NoOp はメインフェイズで発動可能", () => {
    const state = createPhaseState("main1");

    const result = fieldSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("FieldSpellActivation - subTypeConditions", () => {
  it("メインフェイズ1で発動可能", () => {
    const state = createPhaseState("main1");

    const result = fieldSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });

  it("ドローフェイズでは発動不可", () => {
    const state = createPhaseState("draw");

    const result = fieldSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("スタンバイフェイズでは発動不可", () => {
    const state = createPhaseState("standby");

    const result = fieldSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("エンドフェイズでは発動不可", () => {
    const state = createPhaseState("end");

    const result = fieldSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("FieldSpellActivation - ステップ生成", () => {
  it("createActivationSteps で発動通知ステップとイベントステップを生成する", () => {
    const state = createPhaseState("main1");

    const steps = fieldSpellActivation.createActivationSteps(state, sourceInstance);

    expect(steps).toHaveLength(2);
    expect(steps[0].id).toBe(`${DUMMY_CARD_IDS.FIELD_SPELL}-activation-notification`);
    expect(steps[0].summary).toBe("カード発動");
    expect(steps[1].id).toBe("emit-spell-activated-field-1");
  });

  it("createResolutionSteps は空配列を返す（フィールド魔法はフィールドに残る）", () => {
    const state = createPhaseState("main1");
    const steps = fieldSpellActivation.createResolutionSteps(state, sourceInstance);

    expect(steps).toEqual([]);
  });
});
