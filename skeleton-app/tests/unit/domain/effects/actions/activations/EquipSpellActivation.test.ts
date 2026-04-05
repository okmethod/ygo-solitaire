/**
 * EquipSpellActivation のテスト
 *
 * 装備魔法発動の抽象基底クラスと、NoOp実装の動作を検証する。
 *
 * TEST STRATEGY:
 * - createNoOp でインスタンスを生成できること
 * - subTypeConditions が正しく機能すること
 * - デフォルト対象選択ステップが生成されること
 * - 装備関係確立ステップが生成されること
 */

import { describe, it, expect, beforeEach } from "vitest";
import { EquipSpellActivation } from "$lib/domain/effects/actions/activations/EquipSpellActivation";
import type { CardInstance } from "$lib/domain/models/Card";
import { CardDataRegistry } from "$lib/domain/cards";
import {
  createMockGameState,
  createCardInstances,
  createMonsterOnField,
  TEST_CARD_IDS,
} from "../../../../../__testUtils__";

// =============================================================================
// テストセットアップ
// =============================================================================

const TEST_EQUIP_CARD_ID = 77777;

beforeEach(() => {
  CardDataRegistry.clear();
  // テスト用装備魔法カードを登録
  CardDataRegistry.register(TEST_EQUIP_CARD_ID, {
    jaName: "テスト装備魔法",
    type: "spell",
    frameType: "spell",
    spellType: "equip",
    edition: "latest",
  });
});

// =============================================================================
// テストヘルパー
// =============================================================================

/** テスト用装備魔法カードインスタンスを生成 */
const createEquipSpellInstance = (cardId: number): CardInstance => ({
  instanceId: "equip-test-instance",
  id: cardId,
  jaName: "テスト装備魔法",
  type: "spell",
  frameType: "spell",
  spellType: "equip",
  edition: "latest",
  location: "hand",
});

/** フィールドにモンスターを配置したゲーム状態を生成 */
const createStateWithFieldMonster = (monsterCount: number = 1) => {
  const monsters = Array.from({ length: monsterCount }, (_, i) =>
    createMonsterOnField(TEST_CARD_IDS.DUMMY, `monster-${i}`, { position: "faceUp", battlePosition: "attack" }),
  );

  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      mainMonsterZone: monsters,
    },
    phase: "main1",
  });
};

/** フィールドにモンスターがない状態を生成 */
const createStateWithoutFieldMonster = () =>
  createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
    },
    phase: "main1",
  });

/** フィールドに裏側表示モンスターのみある状態を生成 */
const createStateWithFaceDownMonster = () =>
  createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      mainMonsterZone: [
        createMonsterOnField(TEST_CARD_IDS.DUMMY, "facedown-monster", {
          position: "faceDown",
          battlePosition: "defense",
        }),
      ],
    },
    phase: "main1",
  });

// =============================================================================
// createNoOp テスト
// =============================================================================

describe("EquipSpellActivation.createNoOp", () => {
  it("createNoOp でインスタンスを生成できる", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);

    expect(activation).toBeInstanceOf(EquipSpellActivation);
    expect(activation.cardId).toBe(TEST_EQUIP_CARD_ID);
  });

  it("NoOp の spellSpeed は 1 である", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);

    expect(activation.spellSpeed).toBe(1);
  });

  it("NoOp の effectCategory は 'activation' である", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);

    expect(activation.effectCategory).toBe("activation");
  });

  it("NoOp はフィールドにモンスターがいれば発動可能", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("EquipSpellActivation - subTypeConditions", () => {
  it("メインフェイズ1で発動可能", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate({ ...state, phase: "main1" }, sourceInstance);

    expect(result.isValid).toBe(true);
  });

  it("ドローフェイズでは発動不可", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate({ ...state, phase: "draw" }, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("スタンバイフェイズでは発動不可", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate({ ...state, phase: "standby" }, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("エンドフェイズでは発動不可", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate({ ...state, phase: "end" }, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("フィールドにモンスターがいない場合は発動不可", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithoutFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NO_VALID_TARGET");
  });

  it("フィールドに裏側表示モンスターのみの場合は発動不可", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFaceDownMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NO_VALID_TARGET");
  });

  it("フィールドに複数モンスターがいても発動可能", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster(3);
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("EquipSpellActivation - ステップ生成", () => {
  it("createActivationSteps でデフォルト対象選択ステップを生成する", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const steps = activation.createActivationSteps(state, sourceInstance);

    // 対象選択ステップが含まれる
    expect(steps.some((s) => s.id.includes("select-equip-target"))).toBe(true);
  });

  it("createResolutionSteps で装備関係確立ステップを生成する", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const steps = activation.createResolutionSteps(state, sourceInstance);

    // 装備関係確立ステップが含まれる
    expect(steps.some((s) => s.id.includes("establish-equip"))).toBe(true);
  });

  it("NoOp の individualActivationSteps は空配列を返す", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const steps = activation.createActivationSteps(state, sourceInstance);

    // NoOp固有のステップはないが、デフォルト対象選択は含まれる
    // 発動通知 + デフォルト対象選択のみ
    const activationStepsWithoutNotify = steps.filter((s) => !s.id.includes("notify"));
    expect(activationStepsWithoutNotify.filter((s) => s.id.includes("select-equip-target")).length).toBe(1);
  });

  it("NoOp の individualResolutionSteps は空配列を返す", () => {
    const activation = EquipSpellActivation.createNoOp(TEST_EQUIP_CARD_ID);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const steps = activation.createResolutionSteps(state, sourceInstance);

    // NoOp固有のステップはないが、装備関係確立と墓地送りは含まれる
    expect(steps.filter((s) => s.id.includes("draw")).length).toBe(0);
  });
});
