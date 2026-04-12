import { describe, it, expect } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { gainLpStep, payLpStep, damageLpStep, lossLpStep } from "$lib/domain/dsl/steps/builders/lifePoints";
import { createMockGameState, DUMMY_CARD_IDS } from "../../../../__testUtils__";

/**
 * LifePointSteps Tests - LP操作系ステップのテスト
 *
 * TEST STRATEGY:
 * - GAIN_LP ステップが正しく動作すること
 * - PAY_LP ステップが正しく動作すること
 * - BURN_DAMAGE ステップが正しく動作すること
 * - BURN_FROM_CONTEXT ステップが正しく動作すること
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
// GAIN_LP ステップのテスト
// =============================================================================

describe("StepRegistry - GAIN_LP", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("GAIN_LP", { amount: 1000 }, createTestContext());

      expect(step.id).toContain("gain-lp");
      expect(step.summary).toContain("LP");
      expect(step.summary).toContain("増加");
      expect(typeof step.action).toBe("function");
    });

    it("target: opponent を指定できる", () => {
      const step = buildStep("GAIN_LP", { amount: 500, target: "opponent" }, createTestContext());

      expect(step.id).toContain("opponent");
      expect(step.summary).toContain("相手");
    });

    it("amount がない場合エラー", () => {
      expect(() => {
        buildStep("GAIN_LP", {}, createTestContext());
      }).toThrow("Argument 'amount' must be a positive integer");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("GAIN_LP")).toBe(true);
    });

    it("getRegisteredNames に含まれる", () => {
      const names = AtomicStepRegistry.getRegisteredNames();
      expect(names).toContain("GAIN_LP");
    });
  });

  describe("action実行", () => {
    it("プレイヤーのLPを回復できる", () => {
      const state = createMockGameState({
        lp: { player: 5000, opponent: 8000 },
      });

      const step = buildStep("GAIN_LP", { amount: 1000 }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.lp.player).toBe(6000);
      expect(result.updatedState.lp.opponent).toBe(8000);
      expect(result.message).toContain("gained 1000 LP");
    });

    it("相手のLPを回復できる", () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: 5000 },
      });

      const step = buildStep("GAIN_LP", { amount: 2000, target: "opponent" }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.lp.player).toBe(8000);
      expect(result.updatedState.lp.opponent).toBe(7000);
    });
  });
});

// =============================================================================
// PAY_LP ステップのテスト
// =============================================================================

describe("StepRegistry - PAY_LP", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("PAY_LP", { amount: 1000 }, createTestContext());

      expect(step.id).toContain("pay-lp");
      expect(step.summary).toContain("支払い");
      expect(typeof step.action).toBe("function");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("PAY_LP")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("プレイヤーのLPを支払える", () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
      });

      const step = buildStep("PAY_LP", { amount: 1000 }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.lp.player).toBe(7000);
      expect(result.message).toContain("paid 1000 LP");
    });

    it("複数回支払える", () => {
      let state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
      });

      const step = buildStep("PAY_LP", { amount: 1000 }, createTestContext());

      // 1回目
      let result = step.action(state);
      state = result.updatedState;
      expect(state.lp.player).toBe(7000);

      // 2回目
      result = step.action(state);
      expect(result.updatedState.lp.player).toBe(6000);
    });
  });
});

// =============================================================================
// BURN_DAMAGE ステップのテスト
// =============================================================================

describe("StepRegistry - BURN_DAMAGE", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("BURN_DAMAGE", { amount: 500 }, createTestContext());

      expect(step.id).toContain("damage");
      expect(step.summary).toContain("ダメージ");
      expect(typeof step.action).toBe("function");
    });

    it("デフォルトで相手を対象にする", () => {
      const step = buildStep("BURN_DAMAGE", { amount: 500 }, createTestContext());

      expect(step.id).toContain("opponent");
    });

    it("target: player を指定できる", () => {
      const step = buildStep("BURN_DAMAGE", { amount: 500, target: "player" }, createTestContext());

      expect(step.id).toContain("player");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("BURN_DAMAGE")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("相手にダメージを与えられる", () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
      });

      const step = buildStep("BURN_DAMAGE", { amount: 500 }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.lp.player).toBe(8000);
      expect(result.updatedState.lp.opponent).toBe(7500);
      expect(result.message).toContain("took 500 LP");
    });

    it("プレイヤーにダメージを与えられる", () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
      });

      const step = buildStep("BURN_DAMAGE", { amount: 1000, target: "player" }, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.lp.player).toBe(7000);
      expect(result.updatedState.lp.opponent).toBe(8000);
    });
  });
});

// =============================================================================
// BURN_FROM_CONTEXT ステップのテスト
// =============================================================================

describe("StepRegistry - BURN_FROM_CONTEXT", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("BURN_FROM_CONTEXT", {}, createTestContext(EFFECT_ID_1));

      expect(step.id).toContain("burn-from-context");
      expect(step.summary).toContain("ダメージ");
      expect(typeof step.action).toBe("function");
    });

    it("effectId がない場合エラー", () => {
      expect(() => {
        buildStep("BURN_FROM_CONTEXT", {}, createTestContext());
      }).toThrow("BURN_FROM_CONTEXT step requires effectId in context");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("BURN_FROM_CONTEXT")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("コンテキストからダメージを取得して適用できる", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [], calculatedDamage: 1500 },
      };
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
        activationContexts: contexts,
      });

      const step = buildStep("BURN_FROM_CONTEXT", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.lp.opponent).toBe(6500);
      expect(result.message).toContain("1500 damage");
    });

    it("コンテキストにダメージがない場合エラー", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [] },
      };
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
        activationContexts: contexts,
      });

      const step = buildStep("BURN_FROM_CONTEXT", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No damage value");
    });

    it("damageTarget: player を指定できる", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [], calculatedDamage: 1000 },
      };
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
        activationContexts: contexts,
      });

      const step = buildStep("BURN_FROM_CONTEXT", { damageTarget: "player" }, createTestContext(EFFECT_ID_1));

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.lp.player).toBe(7000);
      expect(result.updatedState.lp.opponent).toBe(8000);
    });

    it("ダメージ適用後にコンテキストがクリアされる", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: [], calculatedDamage: 500 },
      };
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
        activationContexts: contexts,
      });

      const step = buildStep("BURN_FROM_CONTEXT", {}, createTestContext(EFFECT_ID_1));

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.activationContexts[EFFECT_ID_1]).toBeUndefined();
    });
  });
});

// =============================================================================
// 直接関数呼び出しのテスト
// =============================================================================

describe("gainLpStep", () => {
  it("LP回復ステップを生成できる", () => {
    const step = gainLpStep(1000, "player");

    expect(step.id).toContain("gain-lp");
    expect(step.id).toContain("player");
  });
});

describe("payLpStep", () => {
  it("LP支払いステップを生成できる", () => {
    const step = payLpStep(500, "player");

    expect(step.id).toContain("pay-lp");
  });
});

describe("damageLpStep", () => {
  it("ダメージステップを生成できる", () => {
    const step = damageLpStep(1000, "opponent");

    expect(step.id).toContain("damage");
    expect(step.id).toContain("opponent");
  });
});

describe("lossLpStep", () => {
  it("LP喪失ステップを生成できる", () => {
    const step = lossLpStep(2000, "player");

    expect(step.id).toContain("loss-lp");
  });
});
