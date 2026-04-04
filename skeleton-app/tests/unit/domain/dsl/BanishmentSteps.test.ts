import { describe, it, expect } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { createMockGameState, TEST_CARD_IDS, createTestSpellCard } from "../../../__testUtils__";

/**
 * BanishmentSteps Tests - 除外系ステップのテスト
 *
 * TEST STRATEGY:
 * - SELECT_AND_BANISH_FROM_GRAVEYARD ステップが正しく生成されること
 * - フィルタータイプ（spell, trap, spell_or_trap, monster）の動作
 * - onSelectコールバックの動作
 */

// =============================================================================
// テストヘルパー
// =============================================================================

// EffectId constants for testing
const EFFECT_ID_1 = "12345-activation" as EffectId;

const createTestContext = (effectId?: EffectId): StepBuildContext => ({
  cardId: TEST_CARD_IDS.DUMMY,
  sourceInstanceId: "source-card",
  effectId,
});

// =============================================================================
// SELECT_AND_BANISH_FROM_GRAVEYARD ステップのテスト
// =============================================================================

describe("StepRegistry - SELECT_AND_BANISH_FROM_GRAVEYARD", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep(
        "SELECT_AND_BANISH_FROM_GRAVEYARD",
        { minCount: 1, maxCount: 3 },
        createTestContext(EFFECT_ID_1),
      );

      expect(step.id).toContain("select-and-banish-from-graveyard");
      expect(step.summary).toContain("除外");
      expect(typeof step.action).toBe("function");
    });

    it("filterType: spell でステップを生成できる", () => {
      const step = buildStep(
        "SELECT_AND_BANISH_FROM_GRAVEYARD",
        { minCount: 1, maxCount: 1, filterType: "spell" },
        createTestContext(),
      );

      expect(step.id).toContain("spell");
      expect(step.summary).toContain("魔法");
    });

    it("filterType: trap でステップを生成できる", () => {
      const step = buildStep(
        "SELECT_AND_BANISH_FROM_GRAVEYARD",
        { minCount: 1, maxCount: 1, filterType: "trap" },
        createTestContext(),
      );

      expect(step.id).toContain("trap");
      expect(step.summary).toContain("罠");
    });

    it("filterType: spell_or_trap でステップを生成できる", () => {
      const step = buildStep(
        "SELECT_AND_BANISH_FROM_GRAVEYARD",
        { minCount: 1, maxCount: 2, filterType: "spell_or_trap" },
        createTestContext(),
      );

      expect(step.id).toContain("spell_or_trap");
      expect(step.summary).toContain("魔法・罠");
    });

    it("filterType: monster でステップを生成できる", () => {
      const step = buildStep(
        "SELECT_AND_BANISH_FROM_GRAVEYARD",
        { minCount: 1, maxCount: 1, filterType: "monster" },
        createTestContext(),
      );

      expect(step.id).toContain("monster");
      expect(step.summary).toContain("モンスター");
    });

    it("faceDown: true でステップを生成できる", () => {
      const step = buildStep(
        "SELECT_AND_BANISH_FROM_GRAVEYARD",
        { minCount: 1, maxCount: 1, faceDown: true },
        createTestContext(),
      );

      expect(step.summary).toContain("裏側");
    });

    it("minCount がない場合エラー", () => {
      expect(() => {
        buildStep("SELECT_AND_BANISH_FROM_GRAVEYARD", { maxCount: 3 }, createTestContext());
      }).toThrow("Argument 'minCount' must be a positive integer");
    });

    it("maxCount がない場合エラー", () => {
      expect(() => {
        buildStep("SELECT_AND_BANISH_FROM_GRAVEYARD", { minCount: 1 }, createTestContext());
      }).toThrow("Argument 'maxCount' must be a positive integer");
    });

    it("maxCount < minCount の場合エラー", () => {
      expect(() => {
        buildStep("SELECT_AND_BANISH_FROM_GRAVEYARD", { minCount: 3, maxCount: 1 }, createTestContext());
      }).toThrow("SELECT_AND_BANISH_FROM_GRAVEYARD step requires maxCount >= minCount");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SELECT_AND_BANISH_FROM_GRAVEYARD")).toBe(true);
    });

    it("getRegisteredNames に含まれる", () => {
      const names = AtomicStepRegistry.getRegisteredNames();
      expect(names).toContain("SELECT_AND_BANISH_FROM_GRAVEYARD");
    });
  });

  describe("action実行", () => {
    it("選択したカードを除外できる", () => {
      // 墓地にカードを準備
      const spellCard = createTestSpellCard("graveyard-spell-0", "normal", { location: "graveyard" });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        space: {
          graveyard: [spellCard],
          banished: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "SELECT_AND_BANISH_FROM_GRAVEYARD",
        { minCount: 1, maxCount: 1 },
        createTestContext(EFFECT_ID_1),
      );

      // カード選択後のaction実行をテスト
      expect(step.cardSelectionConfig).toBeDefined();

      // action関数にselectedInstanceIdsを渡して実行
      const result = step.action(state, ["graveyard-spell-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.graveyard.length).toBe(0);
      expect(result.updatedState.space.banished.length).toBe(1);
      expect(result.message).toContain("Banished 1 card(s)");
    });

    it("複数カードを除外できる", () => {
      const spell1 = createTestSpellCard("graveyard-spell-0", "normal", { location: "graveyard" });
      const spell2 = createTestSpellCard("graveyard-spell-1", "normal", { location: "graveyard" });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        space: {
          graveyard: [spell1, spell2],
          banished: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "SELECT_AND_BANISH_FROM_GRAVEYARD",
        { minCount: 2, maxCount: 2 },
        createTestContext(EFFECT_ID_1),
      );

      const result = step.action(state, ["graveyard-spell-0", "graveyard-spell-1"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.graveyard.length).toBe(0);
      expect(result.updatedState.space.banished.length).toBe(2);
    });

    it("最低枚数を選択しない場合エラー", () => {
      const spell1 = createTestSpellCard("graveyard-spell-0", "normal", { location: "graveyard" });
      const spell2 = createTestSpellCard("graveyard-spell-1", "normal", { location: "graveyard" });

      const state = createMockGameState({
        space: {
          graveyard: [spell1, spell2],
          banished: [],
        },
      });

      const step = buildStep("SELECT_AND_BANISH_FROM_GRAVEYARD", { minCount: 2, maxCount: 3 }, createTestContext());

      // 1枚しか選択しない
      const result = step.action(state, ["graveyard-spell-0"]);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Must select at least 2 card(s)");
    });

    it("除外枚数がコンテキストに記録される", () => {
      const spell1 = createTestSpellCard("graveyard-spell-0", "normal", { location: "graveyard" });
      const spell2 = createTestSpellCard("graveyard-spell-1", "normal", { location: "graveyard" });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        space: {
          graveyard: [spell1, spell2],
          banished: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "SELECT_AND_BANISH_FROM_GRAVEYARD",
        { minCount: 1, maxCount: 2 },
        createTestContext(EFFECT_ID_1),
      );

      const result = step.action(state, ["graveyard-spell-0", "graveyard-spell-1"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.activationContexts[EFFECT_ID_1]?.paidCosts).toBe(2);
    });
  });

  describe("cardSelectionConfig プロパティ", () => {
    it("_sourceZone が graveyard に設定される", () => {
      const step = buildStep("SELECT_AND_BANISH_FROM_GRAVEYARD", { minCount: 1, maxCount: 1 }, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?._sourceZone).toBe("graveyard");
    });

    it("minCards と maxCards が正しく設定される", () => {
      const step = buildStep("SELECT_AND_BANISH_FROM_GRAVEYARD", { minCount: 2, maxCount: 5 }, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?.minCards).toBe(2);
      expect(config?.maxCards).toBe(5);
    });

    it("cancelable が false に設定される", () => {
      const step = buildStep("SELECT_AND_BANISH_FROM_GRAVEYARD", { minCount: 1, maxCount: 1 }, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?.cancelable).toBe(false);
    });
  });
});
