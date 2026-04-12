/**
 * 特殊召喚系ステップのテスト
 */

import { describe, it, expect } from "vitest";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import {
  createMockGameState,
  createMonsterInstance,
  createFilledMonsterZone,
  createStepBuildContext,
} from "../../../../__testUtils__";

// テスト用 EffectId 定数
const EFFECT_ID_1 = "12345-activation" as EffectId;

// =============================================================================
// SPECIAL_SUMMON_FROM_DECK ステップのテスト
// =============================================================================

describe("StepRegistry - SPECIAL_SUMMON_FROM_DECK", () => {
  describe("ステップ生成", () => {
    it("filterType: monster でステップを生成できる", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_DECK", { filterType: "monster" }, createStepBuildContext());

      expect(step.id).toContain("special-summon-from-deck");
      expect(step.summary).toContain("モンスター");
      expect(step.summary).toContain("特殊召喚");
      expect(typeof step.action).toBe("function");
    });

    it("filterType: normal_monster でステップを生成できる", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_DECK", { filterType: "normal_monster" }, createStepBuildContext());

      expect(step.id).toContain("special-summon-from-deck");
      expect(step.summary).toContain("通常");
    });

    it("filterLevel で静的レベルフィルターを設定できる", () => {
      const step = buildStep(
        "SPECIAL_SUMMON_FROM_DECK",
        { filterType: "monster", filterLevel: 4 },
        createStepBuildContext(),
      );

      expect(step.id).toContain("level4");
      expect(step.summary).toContain("レベル4");
    });

    it("filterLevel: paidCosts で動的フィルターを設定できる", () => {
      const step = buildStep(
        "SPECIAL_SUMMON_FROM_DECK",
        { filterType: "monster", filterLevel: "paidCosts" },
        createStepBuildContext({ effectId: EFFECT_ID_1 }),
      );

      expect(step.id).toContain("paidCosts");
      expect(step.summary).toContain("動的レベル");
    });

    it("battlePosition: defense を設定できる", () => {
      const step = buildStep(
        "SPECIAL_SUMMON_FROM_DECK",
        { filterType: "monster", battlePosition: "defense" },
        createStepBuildContext(),
      );

      expect(step.id).toContain("special-summon-from-deck");
      expect(typeof step.action).toBe("function");
    });

    it("filterType がない場合エラー", () => {
      expect(() => {
        buildStep("SPECIAL_SUMMON_FROM_DECK", {}, createStepBuildContext());
      }).toThrow();
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SPECIAL_SUMMON_FROM_DECK")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("デッキからモンスターを特殊召喚できる", () => {
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const state = createMockGameState({
        space: {
          mainDeck: [monster],
          mainMonsterZone: [],
        },
      });

      const step = buildStep("SPECIAL_SUMMON_FROM_DECK", { filterType: "monster" }, createStepBuildContext());

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);
      expect(result.message).toContain("Special summoned");
    });

    it("デッキにモンスターがいない場合エラー", () => {
      const state = createMockGameState({
        space: {
          mainDeck: [], // 空
          mainMonsterZone: [],
        },
      });

      const step = buildStep("SPECIAL_SUMMON_FROM_DECK", { filterType: "monster" }, createStepBuildContext());

      const result = step.action(state, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No cards available");
    });

    it("モンスターゾーンが満杯の場合エラー", () => {
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const state = createMockGameState({
        space: {
          mainDeck: [monster],
          ...createFilledMonsterZone(5),
        },
      });

      const step = buildStep("SPECIAL_SUMMON_FROM_DECK", { filterType: "monster" }, createStepBuildContext());

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(false);
    });

    it("選択されていない場合エラー", () => {
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const state = createMockGameState({
        space: {
          mainDeck: [monster],
          mainMonsterZone: [],
        },
      });

      const step = buildStep("SPECIAL_SUMMON_FROM_DECK", { filterType: "monster" }, createStepBuildContext());

      const result = step.action(state, []); // 選択なし

      expect(result.success).toBe(false);
      expect(result.error).toContain("No cards selected");
    });
  });

  describe("cardSelectionConfig", () => {
    it("_sourceZone が mainDeck に設定される", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_DECK", { filterType: "monster" }, createStepBuildContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?._sourceZone).toBe("mainDeck");
    });

    it("minCards と maxCards が 1 に設定される", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_DECK", { filterType: "monster" }, createStepBuildContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?.minCards).toBe(1);
      expect(config?.maxCards).toBe(1);
    });
  });
});

// =============================================================================
// SPECIAL_SUMMON_FROM_EXTRA_DECK ステップのテスト
// =============================================================================

describe("StepRegistry - SPECIAL_SUMMON_FROM_EXTRA_DECK", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_EXTRA_DECK", {}, createStepBuildContext());

      expect(step.id).toContain("special-summon-from-extra-deck");
      expect(step.summary).toContain("特殊召喚");
      expect(typeof step.action).toBe("function");
    });

    it("filterMaxLevel を設定できる", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_EXTRA_DECK", { filterMaxLevel: 4 }, createStepBuildContext());

      expect(step.id).toContain("level4");
      expect(step.summary).toContain("レベル4以下");
    });

    it("filterFrameType: fusion を設定できる", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_EXTRA_DECK", { filterFrameType: "fusion" }, createStepBuildContext());

      expect(step.id).toContain("fusion");
      expect(step.summary).toContain("融合");
    });

    it("battlePosition: defense を設定できる", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_EXTRA_DECK", { battlePosition: "defense" }, createStepBuildContext());

      expect(typeof step.action).toBe("function");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SPECIAL_SUMMON_FROM_EXTRA_DECK")).toBe(true);
    });
  });

  describe("cardSelectionConfig", () => {
    it("_sourceZone が extraDeck に設定される", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_EXTRA_DECK", {}, createStepBuildContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?._sourceZone).toBe("extraDeck");
    });
  });
});

// =============================================================================
// SPECIAL_SUMMON_FROM_CONTEXT ステップのテスト
// =============================================================================

describe("StepRegistry - SPECIAL_SUMMON_FROM_CONTEXT", () => {
  describe("ステップ生成", () => {
    it("effectIdがcontextにあればステップを生成できる", () => {
      const step = buildStep("SPECIAL_SUMMON_FROM_CONTEXT", {}, createStepBuildContext({ effectId: EFFECT_ID_1 }));

      expect(step.id).toContain("special-summon-from-context");
      expect(step.summary).toContain("特殊召喚");
      expect(typeof step.action).toBe("function");
    });

    it("battlePosition: defense を設定できる", () => {
      const step = buildStep(
        "SPECIAL_SUMMON_FROM_CONTEXT",
        { battlePosition: "defense" },
        createStepBuildContext({ effectId: EFFECT_ID_1 }),
      );

      expect(typeof step.action).toBe("function");
    });

    it("clearContext: false を設定できる", () => {
      const step = buildStep(
        "SPECIAL_SUMMON_FROM_CONTEXT",
        { clearContext: false },
        createStepBuildContext({ effectId: EFFECT_ID_1 }),
      );

      expect(typeof step.action).toBe("function");
    });

    it("effectIdがない場合エラー", () => {
      expect(() => {
        buildStep("SPECIAL_SUMMON_FROM_CONTEXT", {}, createStepBuildContext());
      }).toThrow("SPECIAL_SUMMON_FROM_CONTEXT step requires effectId in context");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SPECIAL_SUMMON_FROM_CONTEXT")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("コンテキストから対象を取得して特殊召喚できる", () => {
      const monster = createMonsterInstance("graveyard-monster", {
        location: "graveyard",
        level: 4,
      });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: ["graveyard-monster"],
        },
      };

      const state = createMockGameState({
        space: {
          graveyard: [monster],
          mainMonsterZone: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("SPECIAL_SUMMON_FROM_CONTEXT", {}, createStepBuildContext({ effectId: EFFECT_ID_1 }));

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.graveyard.length).toBe(0);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);
      expect(result.message).toContain("Special summoned");
    });

    it("コンテキストに対象がない場合エラー", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: [], // 空
        },
      };

      const state = createMockGameState({
        space: {
          graveyard: [],
          mainMonsterZone: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("SPECIAL_SUMMON_FROM_CONTEXT", {}, createStepBuildContext({ effectId: EFFECT_ID_1 }));

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No target found");
    });

    it("対象が墓地にない場合は不発（コンテキストクリア）", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: ["nonexistent-monster"],
        },
      };

      const state = createMockGameState({
        space: {
          graveyard: [], // 対象がいない
          mainMonsterZone: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("SPECIAL_SUMMON_FROM_CONTEXT", {}, createStepBuildContext({ effectId: EFFECT_ID_1 }));

      const result = step.action(state);

      expect(result.success).toBe(true); // 不発は成功扱い
      expect(result.message).toContain("fizzles");
      // コンテキストがクリアされている
      expect(result.updatedState.activationContexts[EFFECT_ID_1]).toBeUndefined();
    });

    it("clearContext: true でコンテキストがクリアされる", () => {
      const monster = createMonsterInstance("graveyard-monster", {
        location: "graveyard",
        level: 4,
      });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: ["graveyard-monster"],
        },
      };

      const state = createMockGameState({
        space: {
          graveyard: [monster],
          mainMonsterZone: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "SPECIAL_SUMMON_FROM_CONTEXT",
        { clearContext: true },
        createStepBuildContext({ effectId: EFFECT_ID_1 }),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.activationContexts[EFFECT_ID_1]).toBeUndefined();
    });

    it("clearContext: false でコンテキストが残る", () => {
      const monster = createMonsterInstance("graveyard-monster", {
        location: "graveyard",
        level: 4,
      });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: ["graveyard-monster"],
        },
      };

      const state = createMockGameState({
        space: {
          graveyard: [monster],
          mainMonsterZone: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep(
        "SPECIAL_SUMMON_FROM_CONTEXT",
        { clearContext: false },
        createStepBuildContext({ effectId: EFFECT_ID_1 }),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.activationContexts[EFFECT_ID_1]).toBeDefined();
    });

    it("モンスターゾーンが満杯の場合エラー", () => {
      const monster = createMonsterInstance("graveyard-monster", {
        location: "graveyard",
        level: 4,
      });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: ["graveyard-monster"],
        },
      };

      const state = createMockGameState({
        space: {
          graveyard: [monster],
          ...createFilledMonsterZone(5),
        },
        activationContexts: contexts,
      });

      const step = buildStep("SPECIAL_SUMMON_FROM_CONTEXT", {}, createStepBuildContext({ effectId: EFFECT_ID_1 }));

      const result = step.action(state);

      expect(result.success).toBe(false);
    });
  });
});
