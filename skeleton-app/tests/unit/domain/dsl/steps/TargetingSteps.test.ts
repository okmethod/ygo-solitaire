import { describe, it, expect } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { selectTargetFromFieldByRaceStep } from "$lib/domain/dsl/steps/builders/targeting";
import { createMockGameState, createTestMonsterCard, TEST_CARD_IDS } from "../../../../__testUtils__";

/**
 * TargetingSteps Tests - 対象選択系ステップのテスト
 *
 * TEST STRATEGY:
 * - SELECT_TARGET_FROM_FIELD_BY_RACE ステップが正しく生成されること
 * - SELECT_TARGETS_FROM_GRAVEYARD ステップが正しく生成されること
 * - 対象がコンテキストに保存されること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

const EFFECT_ID_1 = "12345-activation" as EffectId;

const createTestContext = (effectId?: EffectId): StepBuildContext => ({
  cardId: TEST_CARD_IDS.DUMMY,
  sourceInstanceId: "source-card",
  effectId,
});

// =============================================================================
// SELECT_TARGET_FROM_FIELD_BY_RACE ステップのテスト
// =============================================================================

describe("StepRegistry - SELECT_TARGET_FROM_FIELD_BY_RACE", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep(
        "SELECT_TARGET_FROM_FIELD_BY_RACE",
        { race: "Spellcaster" },
        createTestContext(EFFECT_ID_1),
      );

      expect(step.id).toContain("select-target-from-field-by-race");
      expect(step.id).toContain("Spellcaster");
      expect(step.summary).toContain("装備対象");
      expect(typeof step.action).toBe("function");
    });

    it("effectId がない場合エラー", () => {
      expect(() => {
        buildStep("SELECT_TARGET_FROM_FIELD_BY_RACE", { race: "Spellcaster" }, createTestContext());
      }).toThrow("SELECT_TARGET_FROM_FIELD_BY_RACE step requires effectId in context");
    });

    it("race がない場合エラー", () => {
      expect(() => {
        buildStep("SELECT_TARGET_FROM_FIELD_BY_RACE", {}, createTestContext(EFFECT_ID_1));
      }).toThrow("Argument 'race' must be a non-empty string");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SELECT_TARGET_FROM_FIELD_BY_RACE")).toBe(true);
    });

    it("getRegisteredNames に含まれる", () => {
      const names = AtomicStepRegistry.getRegisteredNames();
      expect(names).toContain("SELECT_TARGET_FROM_FIELD_BY_RACE");
    });
  });

  describe("action実行", () => {
    it("選択したモンスターを対象としてコンテキストに保存できる", () => {
      const monster = createTestMonsterCard("field-monster-0", { location: "mainMonsterZone" });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        space: {
          mainMonsterZone: [monster],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "SELECT_TARGET_FROM_FIELD_BY_RACE",
        { race: "Spellcaster" },
        createTestContext(EFFECT_ID_1),
      );

      const result = step.action(state, ["field-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.activationContexts[EFFECT_ID_1]?.targets).toContain("field-monster-0");
      expect(result.message).toContain("equip target");
    });

    it("対象が選択されていない場合エラー", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        space: {
          mainMonsterZone: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "SELECT_TARGET_FROM_FIELD_BY_RACE",
        { race: "Spellcaster" },
        createTestContext(EFFECT_ID_1),
      );

      const result = step.action(state, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No target selected");
    });
  });

  describe("cardSelectionConfig プロパティ", () => {
    it("_sourceZone が mainMonsterZone に設定される", () => {
      const step = buildStep(
        "SELECT_TARGET_FROM_FIELD_BY_RACE",
        { race: "Spellcaster" },
        createTestContext(EFFECT_ID_1),
      );
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?._sourceZone).toBe("mainMonsterZone");
    });

    it("minCards と maxCards が 1 に設定される", () => {
      const step = buildStep(
        "SELECT_TARGET_FROM_FIELD_BY_RACE",
        { race: "Spellcaster" },
        createTestContext(EFFECT_ID_1),
      );
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?.minCards).toBe(1);
      expect(config?.maxCards).toBe(1);
    });

    it("_filter が種族でフィルタリングする", () => {
      const step = buildStep(
        "SELECT_TARGET_FROM_FIELD_BY_RACE",
        { race: "Spellcaster" },
        createTestContext(EFFECT_ID_1),
      );
      const config = step.cardSelectionConfig!(createMockGameState());
      const filter = config?._filter;
      expect(filter).toBeDefined();

      // Spellcaster モンスター（表側表示）は通過
      const spellcaster = {
        ...createTestMonsterCard("test-1", { location: "mainMonsterZone" }),
        race: "Spellcaster",
        stateOnField: {
          position: "faceUp" as const,
          counters: [],
          activatedEffects: new Set<string>(),
          placedThisTurn: false,
        },
      };
      expect(filter!(spellcaster)).toBe(true);

      // 異なる種族は除外
      const warrior = { ...spellcaster, race: "Warrior" };
      expect(filter!(warrior)).toBe(false);

      // 裏側表示は除外
      const faceDown = {
        ...spellcaster,
        stateOnField: {
          position: "faceDown" as const,
          counters: [],
          activatedEffects: new Set<string>(),
          placedThisTurn: false,
        },
      };
      expect(filter!(faceDown)).toBe(false);
    });
  });
});

// =============================================================================
// SELECT_TARGETS_FROM_GRAVEYARD ステップのテスト
// =============================================================================

describe("StepRegistry - SELECT_TARGETS_FROM_GRAVEYARD", () => {
  describe("ステップ生成", () => {
    it("count省略時（1体）のステップを生成できる", () => {
      const step = buildStep("SELECT_TARGETS_FROM_GRAVEYARD", {}, createTestContext(EFFECT_ID_1));

      expect(step.id).toContain("select-targets-from-graveyard-1");
      expect(step.summary).toContain("1体");
      expect(typeof step.action).toBe("function");
    });

    it("count指定時のステップを生成できる", () => {
      const step = buildStep("SELECT_TARGETS_FROM_GRAVEYARD", { count: 3 }, createTestContext(EFFECT_ID_1));

      expect(step.id).toContain("select-targets-from-graveyard-3");
      expect(step.summary).toContain("3体");
    });

    it("effectId がない場合エラー", () => {
      expect(() => {
        buildStep("SELECT_TARGETS_FROM_GRAVEYARD", {}, createTestContext());
      }).toThrow("SELECT_TARGETS_FROM_GRAVEYARD step requires effectId in context");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SELECT_TARGETS_FROM_GRAVEYARD")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("選択したモンスターを対象としてコンテキストに保存できる", () => {
      const monster = createTestMonsterCard("graveyard-monster-0", { location: "graveyard" });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        space: {
          graveyard: [monster],
        },
        activationContexts: contexts,
      });

      const step = buildStep("SELECT_TARGETS_FROM_GRAVEYARD", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state, ["graveyard-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.activationContexts[EFFECT_ID_1]?.targets).toContain("graveyard-monster-0");
    });

    it("対象が選択されていない場合エラー", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        space: {
          graveyard: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("SELECT_TARGETS_FROM_GRAVEYARD", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No targets selected");
    });
  });

  describe("cardSelectionConfig プロパティ", () => {
    it("_sourceZone が graveyard に設定される", () => {
      const step = buildStep("SELECT_TARGETS_FROM_GRAVEYARD", {}, createTestContext(EFFECT_ID_1));
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?._sourceZone).toBe("graveyard");
    });

    it("_filter がモンスターのみを対象とする", () => {
      const step = buildStep("SELECT_TARGETS_FROM_GRAVEYARD", {}, createTestContext(EFFECT_ID_1));
      const config = step.cardSelectionConfig!(createMockGameState());
      const filter = config?._filter;
      expect(filter).toBeDefined();

      // モンスターは通過
      const monster = createTestMonsterCard("test-1", { location: "graveyard" });
      expect(filter!(monster)).toBe(true);
    });
  });
});

// =============================================================================
// 直接関数呼び出しのテスト
// =============================================================================

describe("selectTargetFromFieldByRaceStep", () => {
  it("種族指定のステップを生成できる", () => {
    const step = selectTargetFromFieldByRaceStep(TEST_CARD_IDS.DUMMY, EFFECT_ID_1, "Dragon");

    expect(step.id).toContain("Dragon");
    expect(step.description).toContain("Dragon");
  });
});
