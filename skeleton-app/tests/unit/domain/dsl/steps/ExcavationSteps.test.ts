import { describe, it, expect } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import {
  createMockGameState,
  createMonsterInstance,
  createSpellInstance,
  createFilledMonsterZone,
  DUMMY_CARD_IDS,
} from "../../../../__testUtils__";

/**
 * ExcavationSteps Tests - デッキめくり系ステップのテスト
 *
 * TEST STRATEGY:
 * - EXCAVATE_UNTIL_MONSTER ステップが正しく生成・実行されること
 * - EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK ステップが正しく生成・実行されること
 * - フィルタリング（_filter, canConfirm）が正しく動作すること
 * - 墓地送り処理とイベント発行が正しく動作すること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

// EffectId constants for testing
const EFFECT_ID_1 = "12345-activation" as EffectId;

const createTestContext = (effectId?: EffectId): StepBuildContext => ({
  cardId: DUMMY_CARD_IDS.NORMAL_MONSTER,
  sourceInstanceId: "source-card",
  effectId,
});

// =============================================================================
// EXCAVATE_UNTIL_MONSTER ステップのテスト
// =============================================================================

describe("StepRegistry - EXCAVATE_UNTIL_MONSTER", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());

      expect(step.id).toContain("excavate-until-monster");
      expect(step.summary).toContain("めくった");
      expect(typeof step.action).toBe("function");
    });

    it("battlePosition: attack でステップを生成できる", () => {
      const step = buildStep("EXCAVATE_UNTIL_MONSTER", { battlePosition: "attack" }, createTestContext());

      expect(typeof step.action).toBe("function");
    });

    it("battlePosition: defense でステップを生成できる", () => {
      const step = buildStep("EXCAVATE_UNTIL_MONSTER", { battlePosition: "defense" }, createTestContext());

      expect(typeof step.action).toBe("function");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("EXCAVATE_UNTIL_MONSTER")).toBe(true);
    });

    it("getRegisteredNames に含まれる", () => {
      const names = AtomicStepRegistry.getRegisteredNames();
      expect(names).toContain("EXCAVATE_UNTIL_MONSTER");
    });
  });

  describe("action実行", () => {
    it("デッキトップがモンスターの場合、そのモンスターを特殊召喚できる", () => {
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const state = createMockGameState({
        space: {
          mainDeck: [monster],
          mainMonsterZone: [],
          graveyard: [],
        },
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainDeck.length).toBe(0);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);
      expect(result.updatedState.space.graveyard.length).toBe(0);
    });

    it("モンスターの前に魔法カードがある場合、魔法を墓地へ送る", () => {
      const spell1 = createSpellInstance("deck-spell-0", { spellType: "normal", location: "mainDeck" });
      const spell2 = createSpellInstance("deck-spell-1", { spellType: "normal", location: "mainDeck" });
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const state = createMockGameState({
        space: {
          mainDeck: [spell1, spell2, monster], // デッキトップから順
          mainMonsterZone: [],
          graveyard: [],
        },
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainDeck.length).toBe(0);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);
      expect(result.updatedState.space.graveyard.length).toBe(2);
      expect(result.message).toContain("墓地へ送り");
    });

    it("デッキにモンスターがいない場合エラー", () => {
      const spell = createSpellInstance("deck-spell-0", { spellType: "normal", location: "mainDeck" });

      const state = createMockGameState({
        space: {
          mainDeck: [spell],
          mainMonsterZone: [],
          graveyard: [],
        },
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());

      const result = step.action(state, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain("モンスターが存在しません");
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
          graveyard: [],
        },
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());

      const result = step.action(state, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No cards selected");
    });

    it("無効な選択の場合エラー", () => {
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const state = createMockGameState({
        space: {
          mainDeck: [monster],
          mainMonsterZone: [],
          graveyard: [],
        },
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());

      const result = step.action(state, ["wrong-monster"]);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid selection");
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
          graveyard: [],
        },
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(false);
    });
  });

  describe("cardSelectionConfig", () => {
    it("_sourceZone が mainDeck に設定される", () => {
      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?._sourceZone).toBe("mainDeck");
    });

    it("cancelable が false に設定される", () => {
      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?.cancelable).toBe(false);
    });

    it("_filter がインデックスに基づいてフィルタリングする", () => {
      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());
      const filter = config?._filter;

      expect(filter).toBeDefined();

      // テスト用のソースゾーン（デッキ）
      const spell = createSpellInstance("deck-spell-0", { spellType: "normal", location: "mainDeck" });
      const monster = createMonsterInstance("deck-monster-0", { location: "mainDeck" });
      const spell2 = createSpellInstance("deck-spell-1", { spellType: "normal", location: "mainDeck" });
      const sourceZone = [spell, monster, spell2];

      // インデックス0（魔法）：最初のモンスター（インデックス1）以前なのでtrue
      expect(filter!(spell, 0, undefined, sourceZone)).toBe(true);

      // インデックス1（モンスター）：最初のモンスターなのでtrue
      expect(filter!(monster, 1, undefined, sourceZone)).toBe(true);

      // インデックス2（魔法）：最初のモンスターより後なのでfalse
      expect(filter!(spell2, 2, undefined, sourceZone)).toBe(false);
    });

    it("canConfirm がモンスター1体選択時のみtrueを返す", () => {
      const step = buildStep("EXCAVATE_UNTIL_MONSTER", {}, createTestContext());
      const canConfirm = step.cardSelectionConfig!(createMockGameState())?.canConfirm;

      expect(canConfirm).toBeDefined();

      const monster = createMonsterInstance("deck-monster-0", { location: "mainDeck" });
      const spell = createSpellInstance("deck-spell-0", { spellType: "normal", location: "mainDeck" });

      // モンスター1体：true
      expect(canConfirm!([monster])).toBe(true);

      // 魔法1体：false
      expect(canConfirm!([spell])).toBe(false);

      // 空：false
      expect(canConfirm!([])).toBe(false);

      // 2体：false
      expect(canConfirm!([monster, monster])).toBe(false);
    });
  });
});

// =============================================================================
// EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK ステップのテスト
// =============================================================================

describe("StepRegistry - EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", () => {
  describe("ステップ生成", () => {
    it("effectIdがcontextにあればステップを生成できる", () => {
      const step = buildStep("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", {}, createTestContext(EFFECT_ID_1));

      expect(step.id).toContain("excavate-until-monster-level-check");
      expect(step.summary).toContain("めくった");
      expect(typeof step.action).toBe("function");
    });

    it("effectIdをargsで指定できる", () => {
      const step = buildStep("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", { effectId: EFFECT_ID_1 }, createTestContext());

      expect(step.id).toContain("excavate-until-monster-level-check");
    });

    it("battlePosition: defense でステップを生成できる", () => {
      const step = buildStep(
        "EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK",
        { battlePosition: "defense" },
        createTestContext(EFFECT_ID_1),
      );

      expect(typeof step.action).toBe("function");
    });

    it("effectIdがない場合エラー", () => {
      expect(() => {
        buildStep("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", {}, createTestContext());
      }).toThrow("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK step requires effectId");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("宣言レベルと異なる場合、モンスターを特殊召喚できる", () => {
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: [],
          declaredInteger: 3, // 宣言レベル3、実際のモンスターレベル4
        },
      };

      const state = createMockGameState({
        space: {
          mainDeck: [monster],
          mainMonsterZone: [],
          graveyard: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);
      expect(result.message).toContain("特殊召喚しました");
    });

    it("宣言レベルと同じ場合、モンスターを墓地へ送る", () => {
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: [],
          declaredInteger: 4, // 宣言レベル4、実際のモンスターレベル4
        },
      };

      const state = createMockGameState({
        space: {
          mainDeck: [monster],
          mainMonsterZone: [],
          graveyard: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(0);
      expect(result.updatedState.space.graveyard.length).toBe(1);
      expect(result.message).toContain("墓地へ送りました");
      expect(result.message).toContain("宣言と同じ");
    });

    it("宣言レベルがコンテキストにない場合エラー", () => {
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: [],
          // declaredInteger is not set
        },
      };

      const state = createMockGameState({
        space: {
          mainDeck: [monster],
          mainMonsterZone: [],
          graveyard: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(false);
      expect(result.error).toContain("宣言レベルが設定されていません");
    });

    it("モンスターの前に魔法カードがある場合、魔法も墓地へ送る（レベル不一致）", () => {
      const spell = createSpellInstance("deck-spell-0", { spellType: "normal", location: "mainDeck" });
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: [],
          declaredInteger: 3,
        },
      };

      const state = createMockGameState({
        space: {
          mainDeck: [spell, monster],
          mainMonsterZone: [],
          graveyard: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);
      expect(result.updatedState.space.graveyard.length).toBe(1); // 魔法のみ
    });

    it("モンスターの前に魔法カードがある場合、全て墓地へ（レベル一致）", () => {
      const spell = createSpellInstance("deck-spell-0", { spellType: "normal", location: "mainDeck" });
      const monster = createMonsterInstance("deck-monster-0", {
        location: "mainDeck",
        level: 4,
      });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: [],
          declaredInteger: 4, // 一致
        },
      };

      const state = createMockGameState({
        space: {
          mainDeck: [spell, monster],
          mainMonsterZone: [],
          graveyard: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state, ["deck-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(0);
      expect(result.updatedState.space.graveyard.length).toBe(2); // 魔法とモンスター
    });

    it("デッキにモンスターがいない場合エラー", () => {
      const spell = createSpellInstance("deck-spell-0", { spellType: "normal", location: "mainDeck" });

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: [],
          declaredInteger: 4,
        },
      };

      const state = createMockGameState({
        space: {
          mainDeck: [spell],
          mainMonsterZone: [],
          graveyard: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain("モンスターが存在しません");
    });
  });
});
