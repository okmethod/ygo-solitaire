import { describe, it, expect } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import {
  createMockGameState,
  createMonsterOnField,
  createSpellOnField,
  TEST_CARD_IDS,
} from "../../../../__testUtils__";

/**
 * EquipSteps Tests - 装備関連ステップのテスト
 *
 * TEST STRATEGY:
 * - ESTABLISH_EQUIP ステップが正しく生成・実行されること
 * - SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD ステップが正しく生成・実行されること
 * - UNEQUIP ステップが正しく生成・実行されること
 * - エラーケースが正しく処理されること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

// EffectId constants for testing
const EFFECT_ID_1 = "12345-activation" as EffectId;

const createTestContext = (options?: { sourceInstanceId?: string; effectId?: EffectId }): StepBuildContext => ({
  cardId: TEST_CARD_IDS.SPELL_EQUIP,
  sourceInstanceId: options?.sourceInstanceId ?? "equip-spell",
  effectId: options?.effectId,
});

// =============================================================================
// ESTABLISH_EQUIP ステップのテスト
// =============================================================================

describe("StepRegistry - ESTABLISH_EQUIP", () => {
  describe("ステップ生成", () => {
    it("argsで全パラメータを指定してステップを生成できる", () => {
      const step = buildStep(
        "ESTABLISH_EQUIP",
        { effectId: EFFECT_ID_1, equipCardInstanceId: "equip-spell" },
        createTestContext(),
      );

      expect(step.id).toContain("establish-equip");
      expect(step.summary).toContain("装備");
      expect(typeof step.action).toBe("function");
    });

    it("contextから値を取得してステップを生成できる", () => {
      const step = buildStep("ESTABLISH_EQUIP", {}, createTestContext({ effectId: EFFECT_ID_1 }));

      expect(step.id).toContain("establish-equip");
      expect(typeof step.action).toBe("function");
    });

    it("effectIdがない場合エラー", () => {
      expect(() => {
        buildStep("ESTABLISH_EQUIP", {}, createTestContext());
      }).toThrow("ESTABLISH_EQUIP step requires effectId");
    });

    it("sourceInstanceIdがない場合エラー", () => {
      expect(() => {
        buildStep("ESTABLISH_EQUIP", { effectId: EFFECT_ID_1 }, {
          cardId: TEST_CARD_IDS.SPELL_EQUIP,
        } as StepBuildContext);
      }).toThrow("ESTABLISH_EQUIP step requires equipCardInstanceId");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("ESTABLISH_EQUIP")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("装備関係を確立できる", () => {
      const monster = createMonsterOnField(TEST_CARD_IDS.DUMMY, "target-monster");

      const equipSpell = createSpellOnField(TEST_CARD_IDS.SPELL_EQUIP, "equip-spell", { spellType: "equip" });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: ["target-monster"],
        },
      };

      const state = createMockGameState({
        space: {
          mainMonsterZone: [monster],
          spellTrapZone: [equipSpell],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "ESTABLISH_EQUIP",
        { effectId: EFFECT_ID_1, equipCardInstanceId: "equip-spell" },
        createTestContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Equipped");

      const updatedEquip = result.updatedState.space.spellTrapZone[0];
      expect(updatedEquip.stateOnField?.equippedTo).toBe("target-monster");

      // コンテキストがクリアされている
      expect(result.updatedState.activationContexts[EFFECT_ID_1]).toBeUndefined();
    });

    it("対象がコンテキストにない場合エラー", () => {
      const equipSpell = createSpellOnField(TEST_CARD_IDS.SPELL_EQUIP, "equip-spell", { spellType: "equip" });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: [], // 空
        },
      };

      const state = createMockGameState({
        space: {
          spellTrapZone: [equipSpell],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "ESTABLISH_EQUIP",
        { effectId: EFFECT_ID_1, equipCardInstanceId: "equip-spell" },
        createTestContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No equip target found");
    });

    it("装備カードが見つからない場合エラー", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: ["target-monster"],
        },
      };

      const state = createMockGameState({
        space: {
          spellTrapZone: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "ESTABLISH_EQUIP",
        { effectId: EFFECT_ID_1, equipCardInstanceId: "equip-spell" },
        createTestContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Equip card not found");
    });

    it("装備対象が見つからない場合エラー", () => {
      const equipSpell = createSpellOnField(TEST_CARD_IDS.SPELL_EQUIP, "equip-spell", { spellType: "equip" });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: ["nonexistent-monster"],
        },
      };

      const state = createMockGameState({
        space: {
          mainMonsterZone: [], // モンスターがいない
          spellTrapZone: [equipSpell],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "ESTABLISH_EQUIP",
        { effectId: EFFECT_ID_1, equipCardInstanceId: "equip-spell" },
        createTestContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Equip target not found");
    });
  });
});

// =============================================================================
// SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD ステップのテスト
// =============================================================================

describe("StepRegistry - SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD", () => {
  describe("ステップ生成", () => {
    it("argsで指定してステップを生成できる", () => {
      const step = buildStep(
        "SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD",
        { equipCardInstanceId: "equip-spell" },
        createTestContext(),
      );

      expect(step.id).toContain("send-equipped-and-self-to-graveyard");
      expect(step.summary).toContain("墓地");
      expect(typeof step.action).toBe("function");
    });

    it("contextから値を取得してステップを生成できる", () => {
      const step = buildStep("SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD", {}, createTestContext());

      expect(step.id).toContain("send-equipped-and-self-to-graveyard");
      expect(typeof step.action).toBe("function");
    });

    it("equipCardInstanceIdがない場合エラー", () => {
      expect(() => {
        buildStep("SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD", {}, { cardId: TEST_CARD_IDS.SPELL_EQUIP } as StepBuildContext);
      }).toThrow("SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD step requires equipCardInstanceId");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("装備モンスターと装備カードを墓地に送れる", () => {
      const monster = createMonsterOnField(TEST_CARD_IDS.DUMMY, "equipped-monster");

      const equipSpell = createSpellOnField(TEST_CARD_IDS.SPELL_EQUIP, "equip-spell", {
        spellType: "equip",
        equippedTo: "equipped-monster",
      });

      const state = createMockGameState({
        space: {
          mainMonsterZone: [monster],
          spellTrapZone: [equipSpell],
          graveyard: [],
        },
      });

      const step = buildStep(
        "SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD",
        { equipCardInstanceId: "equip-spell" },
        createTestContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(0);
      expect(result.updatedState.space.spellTrapZone.length).toBe(0);
      expect(result.updatedState.space.graveyard.length).toBe(2);
    });

    it("装備カードが見つからない場合エラー", () => {
      const state = createMockGameState({
        space: {
          spellTrapZone: [],
        },
      });

      const step = buildStep(
        "SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD",
        { equipCardInstanceId: "equip-spell" },
        createTestContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Equip card not found");
    });

    it("装備されていない場合エラー", () => {
      const equipSpell = createSpellOnField(TEST_CARD_IDS.SPELL_EQUIP, "equip-spell", { spellType: "equip" });
      // equippedTo が未設定

      const state = createMockGameState({
        space: {
          spellTrapZone: [equipSpell],
        },
      });

      const step = buildStep(
        "SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD",
        { equipCardInstanceId: "equip-spell" },
        createTestContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("not equipped to any monster");
    });
  });
});

// =============================================================================
// UNEQUIP ステップのテスト
// =============================================================================

describe("StepRegistry - UNEQUIP", () => {
  describe("ステップ生成", () => {
    it("argsで指定してステップを生成できる", () => {
      const step = buildStep("UNEQUIP", { equipCardInstanceId: "equip-spell" }, createTestContext());

      expect(step.id).toContain("unequip");
      expect(step.summary).toContain("装備解除");
      expect(typeof step.action).toBe("function");
    });

    it("contextから値を取得してステップを生成できる", () => {
      const step = buildStep("UNEQUIP", {}, createTestContext());

      expect(step.id).toContain("unequip");
      expect(typeof step.action).toBe("function");
    });

    it("equipCardInstanceIdがない場合エラー", () => {
      expect(() => {
        buildStep("UNEQUIP", {}, { cardId: TEST_CARD_IDS.SPELL_EQUIP } as StepBuildContext);
      }).toThrow("UNEQUIP step requires equipCardInstanceId");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("UNEQUIP")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("装備を解除できる", () => {
      const equipSpell = createSpellOnField(TEST_CARD_IDS.SPELL_EQUIP, "equip-spell", {
        spellType: "equip",
        equippedTo: "some-monster",
      });

      const state = createMockGameState({
        space: {
          spellTrapZone: [equipSpell],
        },
      });

      const step = buildStep("UNEQUIP", { equipCardInstanceId: "equip-spell" }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone[0].stateOnField?.equippedTo).toBeUndefined();
    });

    it("装備カードが見つからない場合エラー", () => {
      const state = createMockGameState({
        space: {
          spellTrapZone: [],
        },
      });

      const step = buildStep("UNEQUIP", { equipCardInstanceId: "equip-spell" }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Equip card not found");
    });

    it("フィールド上にない装備カードは成功扱い", () => {
      // stateOnField がない（手札などにある）
      const equipSpell = {
        instanceId: "equip-spell",
        id: TEST_CARD_IDS.SPELL_EQUIP,
        jaName: "Equip Spell",
        type: "spell" as const,
        frameType: "spell" as const,
        edition: "latest" as const,
        location: "hand" as const,
        spellType: "equip" as const,
      };

      const state = createMockGameState({
        space: {
          hand: [equipSpell],
        },
      });

      const step = buildStep("UNEQUIP", { equipCardInstanceId: "equip-spell" }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.message).toContain("not on field");
    });
  });
});
