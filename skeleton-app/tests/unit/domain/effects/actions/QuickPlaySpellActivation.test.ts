/**
 * 速攻魔法発動の抽象クラスのテスト
 *
 * createNoOp で生成される効果無しインスタンスにより動作検証する。
 */

import { describe, it, expect } from "vitest";
import { QuickPlaySpellActivation } from "$lib/domain/effects/actions/activations/QuickPlaySpellActivation";
import { createPhaseState, DUMMY_CARD_IDS, createSpellInstance, createSpellOnField } from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const quickPlaySpellActivation = QuickPlaySpellActivation.createNoOp(DUMMY_CARD_IDS.QUICKPLAY_SPELL);
const sourceInstance = createSpellInstance("quickplay-1", {
  cardId: DUMMY_CARD_IDS.QUICKPLAY_SPELL,
  spellType: "quick-play",
});

// =============================================================================
// createNoOp テスト
// =============================================================================

describe("QuickPlaySpellActivation.createNoOp", () => {
  it("createNoOp でインスタンスを生成できる", () => {
    expect(quickPlaySpellActivation).toBeInstanceOf(QuickPlaySpellActivation);
    expect(quickPlaySpellActivation.cardId).toBe(DUMMY_CARD_IDS.QUICKPLAY_SPELL);
  });

  it("NoOp の spellSpeed は 2 である", () => {
    expect(quickPlaySpellActivation.spellSpeed).toBe(2);
  });

  it("NoOp の effectCategory は 'activation' である", () => {
    expect(quickPlaySpellActivation.effectCategory).toBe("activation");
  });

  it("NoOp は手札から発動可能", () => {
    const state = createPhaseState("main1");

    const result = quickPlaySpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("QuickPlaySpellActivation - subTypeConditions", () => {
  it("フェーズ制限なし：ドローフェイズでも手札から発動可能", () => {
    const state = createPhaseState("draw");

    const result = quickPlaySpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });

  it("フェーズ制限なし：スタンバイフェイズでも手札から発動可能", () => {
    const state = createPhaseState("standby");

    const result = quickPlaySpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });

  it("フェーズ制限なし：エンドフェイズでも手札から発動可能", () => {
    const state = createPhaseState("end");

    const result = quickPlaySpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });

  it("セットしたターンに裏側表示で発動不可", () => {
    const state = createPhaseState("main1");
    const faceDownInstance = createSpellOnField("quickplay-set-1", {
      cardId: DUMMY_CARD_IDS.QUICKPLAY_SPELL,
      spellType: "quick-play",
      position: "faceDown",
      placedThisTurn: true,
    });

    const result = quickPlaySpellActivation.canActivate(state, faceDownInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("QUICK_PLAY_RESTRICTION");
  });

  it("セット済みでも次のターン以降（placedThisTurn: false）なら発動可能", () => {
    const state = createPhaseState("main1");
    const faceDownInstance = createSpellOnField("quickplay-set-2", {
      cardId: DUMMY_CARD_IDS.QUICKPLAY_SPELL,
      spellType: "quick-play",
      position: "faceDown",
      placedThisTurn: false,
    });

    const result = quickPlaySpellActivation.canActivate(state, faceDownInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("QuickPlaySpellActivation - ステップ生成", () => {
  it("createActivationSteps で発動通知ステップとイベントステップを生成する", () => {
    const state = createPhaseState("main1");

    const steps = quickPlaySpellActivation.createActivationSteps(state, sourceInstance);

    expect(steps).toHaveLength(2);
    expect(steps[0].id).toBe(`${DUMMY_CARD_IDS.QUICKPLAY_SPELL}-activation-notification`);
    expect(steps[0].summary).toBe("カード発動");
    expect(steps[1].id).toBe("emit-spell-activated-quickplay-1");
  });

  it("createResolutionSteps で墓地送りステップを生成する（速攻魔法は効果解決後に墓地へ）", () => {
    const state = createPhaseState("main1");

    const steps = quickPlaySpellActivation.createResolutionSteps(state, sourceInstance);

    expect(steps).toHaveLength(1);
    expect(steps[0].id).toBe("send-quickplay-1-to-graveyard");
  });
});
