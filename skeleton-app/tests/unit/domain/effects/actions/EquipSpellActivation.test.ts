/**
 * 装備魔法発動の抽象クラスのテスト
 *
 * createNoOp で生成される効果無しインスタンスにより動作検証する。
 */

import { describe, it, expect } from "vitest";
import type { GameSnapshot, GamePhase } from "$lib/domain/models/GameState";
import { EquipSpellActivation } from "$lib/domain/effects/actions/activations/EquipSpellActivation";
import {
  createSpaceState,
  createMonsterOnField,
  createFilledMonsterZone,
  DUMMY_CARD_IDS,
  createSpellInstance,
} from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const equipSpellActivation = EquipSpellActivation.createNoOp(DUMMY_CARD_IDS.EQUIP_SPELL);
const stateHasMonsterOnField = (phase?: GamePhase): GameSnapshot => {
  return {
    ...createSpaceState({
      ...createFilledMonsterZone(1), // フィールドにモンスターがいる
    }),
    phase: phase ?? "main1", // フェイズを上書き可能
  };
};
const sourceInstance = createSpellInstance("equip-1", { cardId: DUMMY_CARD_IDS.EQUIP_SPELL, spellType: "equip" });

// =============================================================================
// createNoOp テスト
// =============================================================================

describe("EquipSpellActivation.createNoOp", () => {
  it("createNoOp でインスタンスを生成できる", () => {
    expect(equipSpellActivation).toBeInstanceOf(EquipSpellActivation);
    expect(equipSpellActivation.cardId).toBe(DUMMY_CARD_IDS.EQUIP_SPELL);
  });

  it("NoOp の spellSpeed は 1 である", () => {
    expect(equipSpellActivation.spellSpeed).toBe(1);
  });

  it("NoOp の effectCategory は 'activation' である", () => {
    expect(equipSpellActivation.effectCategory).toBe("activation");
  });

  it("NoOp はフィールドにモンスターがいれば発動可能", () => {
    const result = equipSpellActivation.canActivate(stateHasMonsterOnField(), sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("EquipSpellActivation - subTypeConditions", () => {
  it("メインフェイズ1で発動可能", () => {
    const result = equipSpellActivation.canActivate(stateHasMonsterOnField(), sourceInstance);

    expect(result.isValid).toBe(true);
  });

  it("ドローフェイズでは発動不可", () => {
    const result = equipSpellActivation.canActivate(stateHasMonsterOnField("draw"), sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("スタンバイフェイズでは発動不可", () => {
    const result = equipSpellActivation.canActivate(stateHasMonsterOnField("standby"), sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("エンドフェイズでは発動不可", () => {
    const result = equipSpellActivation.canActivate(stateHasMonsterOnField("end"), sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("フィールドにモンスターがいない場合は発動不可", () => {
    const state = createSpaceState();

    const result = equipSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NO_VALID_TARGET");
  });

  it("フィールドに裏側表示モンスターのみの場合は発動不可", () => {
    const state = createSpaceState({
      mainMonsterZone: [
        createMonsterOnField("facedown-monster", {
          position: "faceDown",
          battlePosition: "defense",
        }),
      ],
    });

    const result = equipSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NO_VALID_TARGET");
  });

  it("フィールドに複数モンスターがいても発動可能", () => {
    const state = createSpaceState({
      ...createFilledMonsterZone(3),
    });

    const result = equipSpellActivation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("EquipSpellActivation - ステップ生成", () => {
  it("createActivationSteps でデフォルト対象選択ステップを生成する", () => {
    const steps = equipSpellActivation.createActivationSteps(stateHasMonsterOnField(), sourceInstance);

    // 対象選択ステップが含まれる
    expect(steps.some((s) => s.id.includes("select-equip-target"))).toBe(true);
  });

  it("createResolutionSteps で装備関係確立ステップを生成する", () => {
    const steps = equipSpellActivation.createResolutionSteps(stateHasMonsterOnField(), sourceInstance);

    // 装備関係確立ステップが含まれる
    expect(steps.some((s) => s.id.includes("establish-equip"))).toBe(true);
  });

  it("EquipSpellActivation の individualActivationSteps は空配列を返す", () => {
    const steps = equipSpellActivation.createActivationSteps(stateHasMonsterOnField(), sourceInstance);

    // EquipSpellActivation固有のステップはないが、デフォルト対象選択は含まれる
    // 発動通知 + デフォルト対象選択のみ
    const activationStepsWithoutNotify = steps.filter((s) => !s.id.includes("notify"));
    expect(activationStepsWithoutNotify.filter((s) => s.id.includes("select-equip-target")).length).toBe(1);
  });

  it("EquipSpellActivation の individualResolutionSteps は空配列を返す", () => {
    const steps = equipSpellActivation.createResolutionSteps(stateHasMonsterOnField(), sourceInstance);

    // EquipSpellActivation固有のステップはないが、装備関係確立と墓地送りは含まれる
    expect(steps.filter((s) => s.id.includes("draw")).length).toBe(0);
  });
});
