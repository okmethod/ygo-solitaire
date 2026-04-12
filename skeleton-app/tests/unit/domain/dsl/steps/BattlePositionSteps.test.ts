/**
 * 表示形式変更ステップのテスト
 */

import { describe, it, expect } from "vitest";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import {
  createMockGameState,
  createMonsterOnField,
  createStepBuildContext,
  DUMMY_CARD_IDS,
} from "../../../../__testUtils__";

// =============================================================================
// CHANGE_BATTLE_POSITION ステップのテスト
// =============================================================================

describe("StepRegistry - CHANGE_BATTLE_POSITION", () => {
  describe("ステップ生成", () => {
    it("攻撃表示に変更するステップを生成できる", () => {
      const step = buildStep(
        "CHANGE_BATTLE_POSITION",
        { position: "attack" },
        createStepBuildContext({ sourceInstanceId: "test-monster" }),
      );

      expect(step.id).toContain("change-battle-position");
      expect(step.id).toContain("attack");
      expect(step.summary).toContain("攻撃表示");
      expect(typeof step.action).toBe("function");
    });

    it("守備表示に変更するステップを生成できる", () => {
      const step = buildStep(
        "CHANGE_BATTLE_POSITION",
        { position: "defense" },
        createStepBuildContext({ sourceInstanceId: "test-monster" }),
      );

      expect(step.id).toContain("change-battle-position");
      expect(step.id).toContain("defense");
      expect(step.summary).toContain("守備表示");
      expect(typeof step.action).toBe("function");
    });

    it("position が無い場合エラー", () => {
      expect(() => {
        buildStep("CHANGE_BATTLE_POSITION", {}, createStepBuildContext());
      }).toThrow('CHANGE_BATTLE_POSITION step requires position to be "attack" or "defense"');
    });

    it("position が不正な値の場合エラー", () => {
      expect(() => {
        buildStep("CHANGE_BATTLE_POSITION", { position: "invalid" }, createStepBuildContext());
      }).toThrow('CHANGE_BATTLE_POSITION step requires position to be "attack" or "defense"');
    });

    it("sourceInstanceId が無い場合エラー", () => {
      expect(() => {
        buildStep("CHANGE_BATTLE_POSITION", { position: "attack" }, { cardId: 12345 });
      }).toThrow("CHANGE_BATTLE_POSITION step requires sourceInstanceId in context");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("CHANGE_BATTLE_POSITION")).toBe(true);
    });

    it("getRegisteredNames に含まれる", () => {
      const names = AtomicStepRegistry.getRegisteredNames();
      expect(names).toContain("CHANGE_BATTLE_POSITION");
    });
  });

  describe("action実行", () => {
    it("守備表示のモンスターを攻撃表示に変更できる", () => {
      const monster = createMonsterOnField("test-monster", {
        position: "faceUp",
        battlePosition: "defense",
      });

      const state = createMockGameState({
        space: {
          mainMonsterZone: [monster],
        },
      });

      const step = buildStep(
        "CHANGE_BATTLE_POSITION",
        { position: "attack" },
        createStepBuildContext({ sourceInstanceId: "test-monster" }),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      const updatedMonster = result.updatedState.space.mainMonsterZone[0];
      expect(updatedMonster.stateOnField?.battlePosition).toBe("attack");
      expect(updatedMonster.stateOnField?.position).toBe("faceUp");
    });

    it("攻撃表示のモンスターを守備表示に変更できる", () => {
      const monster = createMonsterOnField("test-monster", {
        position: "faceUp",
        battlePosition: "attack",
      });

      const state = createMockGameState({
        space: {
          mainMonsterZone: [monster],
        },
      });

      const step = buildStep(
        "CHANGE_BATTLE_POSITION",
        { position: "defense" },
        createStepBuildContext({ sourceInstanceId: "test-monster" }),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      const updatedMonster = result.updatedState.space.mainMonsterZone[0];
      expect(updatedMonster.stateOnField?.battlePosition).toBe("defense");
      expect(updatedMonster.stateOnField?.position).toBe("faceUp");
    });

    it("既に同じ表示形式の場合は成功するが変化なし", () => {
      const monster = createMonsterOnField("test-monster", {
        position: "faceUp",
        battlePosition: "attack",
      });

      const state = createMockGameState({
        space: {
          mainMonsterZone: [monster],
        },
      });

      const step = buildStep(
        "CHANGE_BATTLE_POSITION",
        { position: "attack" },
        createStepBuildContext({ sourceInstanceId: "test-monster" }),
      );

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Already in attack position");
    });

    it("カードが見つからない場合エラー", () => {
      const state = createMockGameState({
        space: {
          mainMonsterZone: [],
        },
      });

      const step = buildStep(
        "CHANGE_BATTLE_POSITION",
        { position: "attack" },
        createStepBuildContext({ sourceInstanceId: "nonexistent" }),
      );

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Card not found");
    });

    it("フィールド上にないカードの場合エラー", () => {
      // stateOnFieldがないカード（手札など）
      const card = {
        instanceId: "test-monster",
        id: DUMMY_CARD_IDS.NORMAL_MONSTER,
        jaName: "Test Monster",
        type: "monster" as const,
        frameType: "normal" as const,
        edition: "latest" as const,
        location: "hand" as const,
        // stateOnField is undefined
      };

      const state = createMockGameState({
        space: {
          hand: [card],
        },
      });

      const step = buildStep(
        "CHANGE_BATTLE_POSITION",
        { position: "attack" },
        createStepBuildContext({ sourceInstanceId: "test-monster" }),
      );

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Card is not on the field");
    });
  });
});
