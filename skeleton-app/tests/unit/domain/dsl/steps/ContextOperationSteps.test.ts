import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { getTargetsFromContext } from "$lib/domain/dsl/steps/builders/contextOperations";
import { createMockGameState, TEST_CARD_IDS } from "../../../../__testUtils__";

/**
 * ContextOperationSteps Tests - コンテキスト操作ステップのテスト
 *
 * TEST STRATEGY:
 * - SAVE_TARGETS_TO_CONTEXT ステップが正しく生成・実行されること
 * - CLEAR_CONTEXT ステップが正しく生成・実行されること
 * - DECLARE_RANDOM_INTEGER ステップが正しく生成・実行されること
 * - getTargetsFromContext ヘルパーが正しく動作すること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

// EffectId constants for testing
const EFFECT_ID_1 = "12345-activation" as EffectId;
const EFFECT_NONEXISTENT = "nonexistent" as EffectId;

const createTestContext = (effectId?: EffectId): StepBuildContext => ({
  cardId: TEST_CARD_IDS.DUMMY,
  sourceInstanceId: "source-card",
  effectId,
});

// =============================================================================
// SAVE_TARGETS_TO_CONTEXT ステップのテスト
// =============================================================================

describe("StepRegistry - SAVE_TARGETS_TO_CONTEXT", () => {
  describe("ステップ生成", () => {
    it("effectIdをargsで指定してステップを生成できる", () => {
      const step = buildStep("SAVE_TARGETS_TO_CONTEXT", { effectId: EFFECT_ID_1 }, createTestContext());

      expect(step.id).toContain("save-targets");
      expect(step.summary).toContain("対象");
      expect(typeof step.action).toBe("function");
    });

    it("effectIdをcontextから取得してステップを生成できる", () => {
      const step = buildStep("SAVE_TARGETS_TO_CONTEXT", {}, createTestContext(EFFECT_ID_1));

      expect(step.id).toContain("save-targets");
      expect(typeof step.action).toBe("function");
    });

    it("summaryをカスタマイズできる", () => {
      const step = buildStep(
        "SAVE_TARGETS_TO_CONTEXT",
        { effectId: EFFECT_ID_1, summary: "カスタム保存" },
        createTestContext(),
      );

      expect(step.summary).toBe("カスタム保存");
    });

    it("effectIdがない場合エラー", () => {
      expect(() => {
        buildStep("SAVE_TARGETS_TO_CONTEXT", {}, createTestContext());
      }).toThrow("SAVE_TARGETS_TO_CONTEXT step requires effectId");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SAVE_TARGETS_TO_CONTEXT")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("選択した対象をコンテキストに保存できる", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        activationContexts: contexts,
      });

      const step = buildStep("SAVE_TARGETS_TO_CONTEXT", { effectId: EFFECT_ID_1 }, createTestContext());

      const result = step.action(state, ["target-1", "target-2"]);

      expect(result.success).toBe(true);
      expect(result.message).toContain("2 target(s)");

      const savedTargets = getTargetsFromContext(result.updatedState, EFFECT_ID_1);
      expect(savedTargets).toEqual(["target-1", "target-2"]);
    });

    it("対象が選択されていない場合エラー", () => {
      const state = createMockGameState({
        activationContexts: {},
      });

      const step = buildStep("SAVE_TARGETS_TO_CONTEXT", { effectId: EFFECT_ID_1 }, createTestContext());

      const result = step.action(state, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No targets selected");
    });

    it("selectedInstanceIdsがundefinedの場合エラー", () => {
      const state = createMockGameState({
        activationContexts: {},
      });

      const step = buildStep("SAVE_TARGETS_TO_CONTEXT", { effectId: EFFECT_ID_1 }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No targets selected");
    });
  });
});

// =============================================================================
// CLEAR_CONTEXT ステップのテスト
// =============================================================================

describe("StepRegistry - CLEAR_CONTEXT", () => {
  describe("ステップ生成", () => {
    it("effectIdをargsで指定してステップを生成できる", () => {
      const step = buildStep("CLEAR_CONTEXT", { effectId: EFFECT_ID_1 }, createTestContext());

      expect(step.id).toContain("clear-context");
      expect(step.summary).toContain("クリア");
      expect(typeof step.action).toBe("function");
    });

    it("effectIdをcontextから取得してステップを生成できる", () => {
      const step = buildStep("CLEAR_CONTEXT", {}, createTestContext(EFFECT_ID_1));

      expect(step.id).toContain("clear-context");
      expect(typeof step.action).toBe("function");
    });

    it("effectIdがない場合エラー", () => {
      expect(() => {
        buildStep("CLEAR_CONTEXT", {}, createTestContext());
      }).toThrow("CLEAR_CONTEXT step requires effectId");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("CLEAR_CONTEXT")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("コンテキストをクリアできる", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: {
          targets: ["target-1", "target-2"],
        },
      };
      const state = createMockGameState({
        activationContexts: contexts,
      });

      const step = buildStep("CLEAR_CONTEXT", { effectId: EFFECT_ID_1 }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.message).toContain("cleared");
    });

    it("存在しないコンテキストをクリアしてもエラーにならない", () => {
      const state = createMockGameState({
        activationContexts: {},
      });

      const step = buildStep("CLEAR_CONTEXT", { effectId: EFFECT_NONEXISTENT }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// DECLARE_RANDOM_INTEGER ステップのテスト
// =============================================================================

describe("StepRegistry - DECLARE_RANDOM_INTEGER", () => {
  beforeEach(() => {
    // Math.random をモック
    vi.spyOn(Math, "random");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("ステップ生成", () => {
    it("必須引数を指定してステップを生成できる", () => {
      const step = buildStep(
        "DECLARE_RANDOM_INTEGER",
        {
          minValue: 1,
          maxValue: 12,
          messageTemplate: "レベル{value}を宣言",
        },
        createTestContext(EFFECT_ID_1),
      );

      expect(step.id).toContain("declare-random-integer");
      expect(step.description).toContain("1〜12");
      expect(typeof step.action).toBe("function");
    });

    it("effectIdをargsで指定できる", () => {
      const step = buildStep(
        "DECLARE_RANDOM_INTEGER",
        {
          effectId: EFFECT_ID_1,
          minValue: 1,
          maxValue: 12,
          messageTemplate: "レベル{value}を宣言",
        },
        createTestContext(),
      );

      expect(step.id).toContain("declare-random-integer");
    });

    it("minValueがない場合エラー", () => {
      expect(() => {
        buildStep(
          "DECLARE_RANDOM_INTEGER",
          { maxValue: 12, messageTemplate: "レベル{value}を宣言" },
          createTestContext(EFFECT_ID_1),
        );
      }).toThrow("Argument 'minValue' must be a positive integer");
    });

    it("maxValueがない場合エラー", () => {
      expect(() => {
        buildStep(
          "DECLARE_RANDOM_INTEGER",
          { minValue: 1, messageTemplate: "レベル{value}を宣言" },
          createTestContext(EFFECT_ID_1),
        );
      }).toThrow("Argument 'maxValue' must be a positive integer");
    });

    it("messageTemplateがない場合エラー", () => {
      expect(() => {
        buildStep("DECLARE_RANDOM_INTEGER", { minValue: 1, maxValue: 12 }, createTestContext(EFFECT_ID_1));
      }).toThrow("Argument 'messageTemplate' must be a string");
    });

    it("effectIdがない場合エラー", () => {
      expect(() => {
        buildStep(
          "DECLARE_RANDOM_INTEGER",
          { minValue: 1, maxValue: 12, messageTemplate: "レベル{value}を宣言" },
          createTestContext(),
        );
      }).toThrow("DECLARE_RANDOM_INTEGER step requires effectId");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("DECLARE_RANDOM_INTEGER")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("ランダム値を生成してコンテキストに保存できる", () => {
      // Math.random が 0.5 を返すようにモック（範囲 1-12 なら 7 になる）
      vi.mocked(Math.random).mockReturnValue(0.5);

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        activationContexts: contexts,
      });

      const step = buildStep(
        "DECLARE_RANDOM_INTEGER",
        {
          minValue: 1,
          maxValue: 12,
          messageTemplate: "レベル{value}を宣言",
        },
        createTestContext(EFFECT_ID_1),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.message).toBe("レベル7を宣言");

      const context = result.updatedState.activationContexts[EFFECT_ID_1];
      expect(context?.declaredInteger).toBe(7);
    });

    it("範囲の最小値を生成できる", () => {
      vi.mocked(Math.random).mockReturnValue(0);

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        activationContexts: contexts,
      });

      const step = buildStep(
        "DECLARE_RANDOM_INTEGER",
        {
          minValue: 1,
          maxValue: 12,
          messageTemplate: "レベル{value}を宣言",
        },
        createTestContext(EFFECT_ID_1),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.message).toBe("レベル1を宣言");
    });

    it("範囲の最大値を生成できる", () => {
      vi.mocked(Math.random).mockReturnValue(0.999);

      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        activationContexts: contexts,
      });

      const step = buildStep(
        "DECLARE_RANDOM_INTEGER",
        {
          minValue: 1,
          maxValue: 12,
          messageTemplate: "レベル{value}を宣言",
        },
        createTestContext(EFFECT_ID_1),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.message).toBe("レベル12を宣言");
    });
  });
});

// =============================================================================
// getTargetsFromContext ヘルパーのテスト
// =============================================================================

describe("getTargetsFromContext", () => {
  it("保存された対象を取得できる", () => {
    const contexts: Record<EffectId, EffectActivationContext> = {
      [EFFECT_ID_1]: {
        targets: ["target-1", "target-2"],
      },
    };
    const state = createMockGameState({
      activationContexts: contexts,
    });

    const targets = getTargetsFromContext(state, EFFECT_ID_1);
    expect(targets).toEqual(["target-1", "target-2"]);
  });

  it("対象がない場合は空配列を返す", () => {
    const contexts: Record<EffectId, EffectActivationContext> = {
      [EFFECT_ID_1]: {
        targets: [], // 空配列の場合
      },
    };
    const state = createMockGameState({
      activationContexts: contexts,
    });

    const targets = getTargetsFromContext(state, EFFECT_ID_1);
    expect(targets).toEqual([]);
  });

  it("コンテキストが存在しない場合は空配列を返す", () => {
    const state = createMockGameState({
      activationContexts: {},
    });

    const targets = getTargetsFromContext(state, EFFECT_NONEXISTENT);
    expect(targets).toEqual([]);
  });
});
