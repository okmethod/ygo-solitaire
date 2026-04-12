/**
 * トークン生成系ステップのテスト
 */

import { describe, it, expect } from "vitest";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import {
  createMockGameState,
  createFilledMonsterZone,
  createStepBuildContext,
  DUMMY_CARD_IDS,
} from "../../../../__testUtils__";

// =============================================================================
// CREATE_TOKEN_MONSTER ステップのテスト
// =============================================================================

describe("StepRegistry - CREATE_TOKEN_MONSTER", () => {
  describe("ステップ生成", () => {
    it("トークン生成ステップを生成できる（攻撃表示）", () => {
      const step = buildStep(
        "CREATE_TOKEN_MONSTER",
        { tokenCardId: DUMMY_CARD_IDS.BASIC_TOKEN, battlePosition: "attack" },
        createStepBuildContext(),
      );

      expect(step.id).toContain("create-token");
      expect(step.summary).toContain("特殊召喚");
      expect(typeof step.action).toBe("function");
    });

    it("トークン生成ステップを生成できる（守備表示）", () => {
      const step = buildStep(
        "CREATE_TOKEN_MONSTER",
        { tokenCardId: DUMMY_CARD_IDS.BASIC_TOKEN, battlePosition: "defense" },
        createStepBuildContext(),
      );

      expect(step.id).toContain("create-token");
      expect(typeof step.action).toBe("function");
    });

    it("battlePosition省略時はデフォルトで攻撃表示", () => {
      const step = buildStep(
        "CREATE_TOKEN_MONSTER",
        { tokenCardId: DUMMY_CARD_IDS.BASIC_TOKEN },
        createStepBuildContext(),
      );

      expect(step.id).toContain("create-token");
      expect(typeof step.action).toBe("function");
    });

    it("tokenCardId が無い場合エラー", () => {
      expect(() => {
        buildStep("CREATE_TOKEN_MONSTER", {}, createStepBuildContext());
      }).toThrow("Argument 'tokenCardId' must be a positive integer");
    });

    it("tokenCardId が不正な値の場合エラー", () => {
      expect(() => {
        buildStep("CREATE_TOKEN_MONSTER", { tokenCardId: -1 }, createStepBuildContext());
      }).toThrow("Argument 'tokenCardId' must be a positive integer");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("CREATE_TOKEN_MONSTER")).toBe(true);
    });

    it("getRegisteredNames に含まれる", () => {
      const names = AtomicStepRegistry.getRegisteredNames();
      expect(names).toContain("CREATE_TOKEN_MONSTER");
    });
  });

  describe("action実行", () => {
    it("トークンをフィールドに攻撃表示で特殊召喚できる", () => {
      const state = createMockGameState({
        space: {
          mainMonsterZone: [],
        },
      });

      const step = buildStep(
        "CREATE_TOKEN_MONSTER",
        { tokenCardId: DUMMY_CARD_IDS.BASIC_TOKEN, battlePosition: "attack" },
        createStepBuildContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);

      const token = result.updatedState.space.mainMonsterZone[0];
      expect(token.id).toBe(DUMMY_CARD_IDS.BASIC_TOKEN);
      expect(token.instanceId).toContain("token-");
      expect(token.location).toBe("mainMonsterZone");
      expect(token.stateOnField?.battlePosition).toBe("attack");
      expect(token.stateOnField?.position).toBe("faceUp");
      expect(token.stateOnField?.placedThisTurn).toBe(true);
    });

    it("トークンをフィールドに守備表示で特殊召喚できる", () => {
      const state = createMockGameState({
        space: {
          mainMonsterZone: [],
        },
      });

      const step = buildStep(
        "CREATE_TOKEN_MONSTER",
        { tokenCardId: DUMMY_CARD_IDS.BASIC_TOKEN, battlePosition: "defense" },
        createStepBuildContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      const token = result.updatedState.space.mainMonsterZone[0];
      expect(token.stateOnField?.battlePosition).toBe("defense");
    });

    it("生成されるトークンのinstanceIdはユニーク", () => {
      const state = createMockGameState({
        space: {
          mainMonsterZone: [],
        },
      });

      const step = buildStep(
        "CREATE_TOKEN_MONSTER",
        { tokenCardId: DUMMY_CARD_IDS.BASIC_TOKEN },
        createStepBuildContext(),
      );

      const result1 = step.action(state);
      const result2 = step.action(state);

      const token1 = result1.updatedState.space.mainMonsterZone[0];
      const token2 = result2.updatedState.space.mainMonsterZone[0];

      expect(token1.instanceId).not.toBe(token2.instanceId);
    });

    it("モンスターゾーンが満杯の場合エラー", () => {
      const state = createMockGameState({
        space: {
          ...createFilledMonsterZone(5), // 5体で満杯
        },
      });

      const step = buildStep(
        "CREATE_TOKEN_MONSTER",
        { tokenCardId: DUMMY_CARD_IDS.BASIC_TOKEN },
        createStepBuildContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("ゾーン");
    });

    it("既存のモンスターがいても空きがあれば召喚できる", () => {
      const state = createMockGameState({
        space: {
          ...createFilledMonsterZone(3), // 3体
        },
      });

      const step = buildStep(
        "CREATE_TOKEN_MONSTER",
        { tokenCardId: DUMMY_CARD_IDS.BASIC_TOKEN },
        createStepBuildContext(),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(4);
    });
  });
});
