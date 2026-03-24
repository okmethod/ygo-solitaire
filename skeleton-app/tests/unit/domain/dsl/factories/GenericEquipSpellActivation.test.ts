/**
 * GenericEquipSpellActivation のテスト
 *
 * DSL定義から装備魔法効果を生成するファクトリクラスの動作を検証する。
 *
 * TEST STRATEGY:
 * - DSL定義から正しくインスタンスが生成されること
 * - useDefaultEquipTargetSelection の切り替えロジック
 * - 条件チェックが正しく機能すること
 * - 発動ステップと効果解決ステップが正しく生成されること
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  GenericEquipSpellActivation,
  createGenericEquipSpellActivation,
} from "$lib/domain/dsl/factories/GenericEquipSpellActivation";
import type { ChainableActionDSL } from "$lib/domain/dsl/types";
import type { CardInstance } from "$lib/domain/models/Card";
import { CardDataRegistry } from "$lib/domain/cards";
import {
  createMockGameState,
  createCardInstances,
  createMonstersOnField,
  createTestSpellCard,
  TEST_CARD_IDS,
} from "../../../../__testUtils__";

// =============================================================================
// テストセットアップ
// =============================================================================

const TEST_EQUIP_CARD_ID = 88888;

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
const createEquipSpellInstance = (cardId: number): CardInstance =>
  createTestSpellCard("equip-test-instance", "equip", { cardId, location: "hand" });

/** フィールドにモンスターを配置したゲーム状態を生成 */
const createStateWithFieldMonster = (monsterCount: number = 1) =>
  createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      mainMonsterZone: createMonstersOnField(monsterCount),
    },
    phase: "main1",
  });

/** フィールドにモンスターがない状態を生成 */
const createStateWithoutFieldMonster = () =>
  createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
    },
    phase: "main1",
  });

// =============================================================================
// インスタンス生成テスト
// =============================================================================

describe("GenericEquipSpellActivation - インスタンス生成", () => {
  it("createGenericEquipSpellActivation でインスタンスを生成できる", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);

    expect(activation).toBeInstanceOf(GenericEquipSpellActivation);
    expect(activation.cardId).toBe(TEST_EQUIP_CARD_ID);
  });

  it("空のDSL定義でもインスタンスを生成できる", () => {
    const dsl: ChainableActionDSL = {};

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);

    expect(activation).toBeInstanceOf(GenericEquipSpellActivation);
  });

  it("spellSpeed は 1 である", () => {
    const dsl: ChainableActionDSL = {};

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);

    expect(activation.spellSpeed).toBe(1);
  });

  it("effectCategory は 'activation' を返す", () => {
    const dsl: ChainableActionDSL = {};

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);

    expect(activation.effectCategory).toBe("activation");
  });
});

// =============================================================================
// 対象選択切り替えテスト
// =============================================================================

describe("GenericEquipSpellActivation - 対象選択切り替え", () => {
  it("SELECT_TARGET_* ステップがない場合はデフォルト対象選択を使用", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "NOTIFY_ACTIVATION", args: {} }],
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    // デフォルト対象選択が有効な場合、対象候補がないとエラー
    const stateWithoutMonster = createStateWithoutFieldMonster();
    const result = activation.canActivate(stateWithoutMonster, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NO_VALID_TARGET");
  });

  it("SELECT_TARGET_* ステップがある場合はデフォルト対象選択を無効化", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "SELECT_TARGET_FROM_GRAVEYARD", args: { count: 1 } }],
      resolutions: [{ step: "SPECIAL_SUMMON_FROM_CONTEXT", args: {} }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const stateWithoutMonster = createStateWithoutFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    // 明示的対象選択が有効な場合、フィールドのモンスターチェックはスキップされる
    const result = activation.canActivate(stateWithoutMonster, sourceInstance);

    // 条件チェック自体は通る（実際の対象選択は発動ステップで行われる）
    expect(result.isValid).toBe(true);
  });

  it("SELECT_TARGET_FROM_FIELD ステップで明示的対象選択を使用", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "SELECT_TARGET_FROM_FIELD", args: { location: "mainMonsterZone" } }],
      resolutions: [{ step: "DESTROY", args: {} }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const stateWithoutMonster = createStateWithoutFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    // 明示的対象選択が有効
    const result = activation.canActivate(stateWithoutMonster, sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// 条件チェックテスト
// =============================================================================

describe("GenericEquipSpellActivation - 条件チェック", () => {
  it("メインフェイズ以外では発動できない", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "SELECT_TARGET_FROM_GRAVEYARD", args: {} }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const state = createMockGameState({
      phase: "draw",
    });
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("NOT_MAIN_PHASE");
  });

  it("条件を満たす場合は canActivate が true を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 1 } }] },
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });

  it("条件を満たさない場合は canActivate が false を返す", () => {
    const dsl: ChainableActionDSL = {
      conditions: { requirements: [{ step: "CAN_DRAW", args: { count: 100 } }] },
      resolutions: [{ step: "DRAW", args: { count: 100 } }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(false);
  });

  it("条件が定義されていない場合は常に canActivate が true を返す", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const result = activation.canActivate(state, sourceInstance);

    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// ステップ生成テスト
// =============================================================================

describe("GenericEquipSpellActivation - ステップ生成", () => {
  it("createActivationSteps で発動ステップを生成できる", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "SELECT_TARGET_FROM_GRAVEYARD", args: { count: 1 } }],
      resolutions: [{ step: "SPECIAL_SUMMON_FROM_CONTEXT", args: {} }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const steps = activation.createActivationSteps(state, sourceInstance);

    expect(steps.some((s) => s.id.includes("select-target-from-graveyard"))).toBe(true);
  });

  it("createResolutionSteps で効果解決ステップを生成できる", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "SELECT_TARGET_FROM_GRAVEYARD", args: {} }],
      resolutions: [{ step: "SPECIAL_SUMMON_FROM_CONTEXT", args: {} }, { step: "THEN" }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const steps = activation.createResolutionSteps(state, sourceInstance);

    expect(steps.length).toBeGreaterThanOrEqual(2);
    // 効果解決ステップに特殊召喚が含まれる
    expect(steps.some((s) => s.id.includes("special-summon-from-context"))).toBe(true);
  });

  it("activations が定義されていない場合は基底クラスのステップのみ返す", () => {
    const dsl: ChainableActionDSL = {
      resolutions: [{ step: "DRAW", args: { count: 1 } }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const steps = activation.createActivationSteps(state, sourceInstance);

    // カード固有の発動ステップはない
    expect(steps.filter((s) => s.id.includes("select-target-from-graveyard")).length).toBe(0);
  });

  it("resolutions が定義されていない場合は基底クラスのステップのみ返す", () => {
    const dsl: ChainableActionDSL = {
      activations: [{ step: "SELECT_TARGET_FROM_GRAVEYARD", args: {} }],
    };

    const activation = createGenericEquipSpellActivation(TEST_EQUIP_CARD_ID, dsl);
    const state = createStateWithFieldMonster();
    const sourceInstance = createEquipSpellInstance(TEST_EQUIP_CARD_ID);

    const steps = activation.createResolutionSteps(state, sourceInstance);

    // カード固有の効果解決ステップはない（基底クラスの処理のみ）
    expect(steps.filter((s) => s.id.includes("special-summon")).length).toBe(0);
  });
});
