import { describe, it, expect } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { selectAndReleaseStep } from "$lib/domain/dsl/steps/builders/releases";
import {
  createMockGameState,
  createFilledMonsterZone,
  createMonsterOnField,
  DUMMY_CARD_IDS,
} from "../../../../__testUtils__";

/**
 * ReleaseSteps Tests - リリース系ステップのテスト
 *
 * TEST STRATEGY:
 * - RELEASE ステップが正しく生成されること
 * - RELEASE_FOR_BURN ステップの動作
 * - excludeEffect オプションの動作
 */

// =============================================================================
// テストヘルパー
// =============================================================================

const EFFECT_ID_1 = "12345-activation" as EffectId;

const createTestContext = (effectId?: EffectId): StepBuildContext => ({
  cardId: DUMMY_CARD_IDS.NORMAL_MONSTER,
  sourceInstanceId: "source-card",
  effectId,
});

// =============================================================================
// RELEASE ステップのテスト
// =============================================================================

describe("StepRegistry - RELEASE", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("RELEASE", {}, createTestContext());

      expect(step.id).toContain("select-release");
      expect(step.summary).toContain("リリース");
      expect(typeof step.action).toBe("function");
    });

    it("count: 2 でステップを生成できる", () => {
      const step = buildStep("RELEASE", { count: 2 }, createTestContext());

      expect(step.description).toContain("2体");
    });

    it("excludeEffect: true でステップを生成できる", () => {
      const step = buildStep("RELEASE", { excludeEffect: true }, createTestContext());

      expect(step.description).toContain("効果モンスター以外");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("RELEASE")).toBe(true);
    });

    it("getRegisteredNames に含まれる", () => {
      const names = AtomicStepRegistry.getRegisteredNames();
      expect(names).toContain("RELEASE");
    });
  });

  describe("action実行", () => {
    it("選択したモンスターをリリースできる", () => {
      const { mainMonsterZone: monsters } = createFilledMonsterZone(1);
      const state = createMockGameState({
        space: {
          mainMonsterZone: monsters,
          graveyard: [],
        },
      });

      const step = buildStep("RELEASE", {}, createTestContext());

      const result = step.action(state, [monsters[0].instanceId]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(0);
      expect(result.updatedState.space.graveyard.length).toBe(1);
      expect(result.message).toContain("リリースしました");
    });

    it("複数モンスターをリリースできる", () => {
      const { mainMonsterZone: monsters } = createFilledMonsterZone(2);
      const state = createMockGameState({
        space: {
          mainMonsterZone: monsters,
          graveyard: [],
        },
      });

      const step = buildStep("RELEASE", { count: 2 }, createTestContext());

      const result = step.action(state, [monsters[0].instanceId, monsters[1].instanceId]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(0);
      expect(result.updatedState.space.graveyard.length).toBe(2);
    });
  });

  describe("cardSelectionConfig プロパティ", () => {
    it("_sourceZone が mainMonsterZone に設定される", () => {
      const step = buildStep("RELEASE", {}, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?._sourceZone).toBe("mainMonsterZone");
    });

    it("minCards と maxCards が count に設定される", () => {
      const step = buildStep("RELEASE", { count: 2 }, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?.minCards).toBe(2);
      expect(config?.maxCards).toBe(2);
    });
  });
});

// =============================================================================
// RELEASE_FOR_BURN ステップのテスト
// =============================================================================

describe("StepRegistry - RELEASE_FOR_BURN", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("RELEASE_FOR_BURN", {}, createTestContext(EFFECT_ID_1));

      expect(step.id).toContain("select-release");
      expect(step.description).toContain("50%");
      expect(typeof step.action).toBe("function");
    });

    it("damageMultiplier を指定できる", () => {
      const step = buildStep("RELEASE_FOR_BURN", { damageMultiplier: 1.0 }, createTestContext(EFFECT_ID_1));

      expect(step.description).toContain("100%");
    });

    it("effectId がない場合エラー", () => {
      expect(() => {
        buildStep("RELEASE_FOR_BURN", {}, createTestContext());
      }).toThrow("RELEASE_FOR_BURN step requires effectId in context");
    });

    it("damageMultiplier が0以下の場合エラー", () => {
      expect(() => {
        buildStep("RELEASE_FOR_BURN", { damageMultiplier: 0 }, createTestContext(EFFECT_ID_1));
      }).toThrow("RELEASE_FOR_BURN step requires damageMultiplier to be a positive number");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("RELEASE_FOR_BURN")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("リリースしてダメージをコンテキストに保存できる", () => {
      const monsters = [createMonsterOnField("monster-0", { attack: 2000 })];

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        space: {
          mainMonsterZone: monsters,
          graveyard: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("RELEASE_FOR_BURN", { damageMultiplier: 0.5 }, createTestContext(EFFECT_ID_1));

      const result = step.action(state, [monsters[0].instanceId]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.graveyard.length).toBe(1);
      // ダメージがコンテキストに保存される (2000 * 0.5 = 1000)
      expect(result.updatedState.activationContexts[EFFECT_ID_1]?.calculatedDamage).toBe(1000);
    });

    it("ダメージ倍率が100%の場合", () => {
      const monsters = [createMonsterOnField("monster-0", { attack: 1500 })];

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        space: {
          mainMonsterZone: monsters,
          graveyard: [],
        },
        activationContexts: contexts,
      });

      const step = buildStep("RELEASE_FOR_BURN", { damageMultiplier: 1.0 }, createTestContext(EFFECT_ID_1));

      const result = step.action(state, [monsters[0].instanceId]);

      expect(result.success).toBe(true);
      // ダメージがコンテキストに保存される (1500 * 1.0 = 1500)
      expect(result.updatedState.activationContexts[EFFECT_ID_1]?.calculatedDamage).toBe(1500);
    });
  });
});

// =============================================================================
// selectAndReleaseStep 共通関数のテスト
// =============================================================================

describe("selectAndReleaseStep", () => {
  it("カスタムフィルターを適用できる", () => {
    const step = selectAndReleaseStep({
      cardId: DUMMY_CARD_IDS.NORMAL_MONSTER,
      count: 1,
      filter: (card) => card.attack !== undefined && card.attack >= 1000,
      onReleased: (state, releasedCards, events) => ({
        success: true,
        updatedState: state,
        message: `Released ${releasedCards.length} card(s)`,
        emittedEvents: events,
      }),
    });

    expect(step.cardSelectionConfig!(createMockGameState())?._filter).toBeDefined();
  });

  it("カスタムサマリーを設定できる", () => {
    const step = selectAndReleaseStep({
      cardId: DUMMY_CARD_IDS.NORMAL_MONSTER,
      count: 1,
      summary: "カスタムサマリー",
      onReleased: (state) => ({
        success: true,
        updatedState: state,
        message: "success",
      }),
    });

    expect(step.summary).toBe("カスタムサマリー");
  });
});
