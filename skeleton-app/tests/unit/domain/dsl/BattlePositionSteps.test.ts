import { describe, it, expect } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { createMockGameState, createFieldCardInstance, TEST_CARD_IDS } from "../../../__testUtils__";

/**
 * BattlePositionSteps Tests - 表示形式変更ステップのテスト
 *
 * TEST STRATEGY:
 * - CHANGE_BATTLE_POSITION ステップが正しく生成されること
 * - action関数が表示形式を正しく変更すること
 * - エラーケースが正しく処理されること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

const createTestContext = (instanceId: string = "test-monster"): StepBuildContext => ({
  cardId: TEST_CARD_IDS.DUMMY,
  sourceInstanceId: instanceId,
});

// =============================================================================
// CHANGE_BATTLE_POSITION ステップのテスト
// =============================================================================

describe("StepRegistry - CHANGE_BATTLE_POSITION", () => {
  describe("ステップ生成", () => {
    it("攻撃表示に変更するステップを生成できる", () => {
      const step = buildStep("CHANGE_BATTLE_POSITION", { position: "attack" }, createTestContext());

      expect(step.id).toContain("change-battle-position");
      expect(step.id).toContain("attack");
      expect(step.summary).toContain("攻撃表示");
      expect(typeof step.action).toBe("function");
    });

    it("守備表示に変更するステップを生成できる", () => {
      const step = buildStep("CHANGE_BATTLE_POSITION", { position: "defense" }, createTestContext());

      expect(step.id).toContain("change-battle-position");
      expect(step.id).toContain("defense");
      expect(step.summary).toContain("守備表示");
      expect(typeof step.action).toBe("function");
    });

    it("position が無い場合エラー", () => {
      expect(() => {
        buildStep("CHANGE_BATTLE_POSITION", {}, createTestContext());
      }).toThrow('CHANGE_BATTLE_POSITION step requires position to be "attack" or "defense"');
    });

    it("position が不正な値の場合エラー", () => {
      expect(() => {
        buildStep("CHANGE_BATTLE_POSITION", { position: "invalid" }, createTestContext());
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
      const monster = createFieldCardInstance({
        instanceId: "test-monster",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
        battlePosition: "defense",
      });

      const state = createMockGameState({
        space: {
          mainMonsterZone: [monster],
        },
      });

      const step = buildStep("CHANGE_BATTLE_POSITION", { position: "attack" }, createTestContext("test-monster"));

      const result = step.action(state);

      expect(result.success).toBe(true);
      const updatedMonster = result.updatedState.space.mainMonsterZone[0];
      expect(updatedMonster.stateOnField?.battlePosition).toBe("attack");
      expect(updatedMonster.stateOnField?.position).toBe("faceUp");
    });

    it("攻撃表示のモンスターを守備表示に変更できる", () => {
      const monster = createFieldCardInstance({
        instanceId: "test-monster",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
        battlePosition: "attack",
      });

      const state = createMockGameState({
        space: {
          mainMonsterZone: [monster],
        },
      });

      const step = buildStep("CHANGE_BATTLE_POSITION", { position: "defense" }, createTestContext("test-monster"));

      const result = step.action(state);

      expect(result.success).toBe(true);
      const updatedMonster = result.updatedState.space.mainMonsterZone[0];
      expect(updatedMonster.stateOnField?.battlePosition).toBe("defense");
      expect(updatedMonster.stateOnField?.position).toBe("faceUp");
    });

    it("既に同じ表示形式の場合は成功するが変化なし", () => {
      const monster = createFieldCardInstance({
        instanceId: "test-monster",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
        battlePosition: "attack",
      });

      const state = createMockGameState({
        space: {
          mainMonsterZone: [monster],
        },
      });

      const step = buildStep("CHANGE_BATTLE_POSITION", { position: "attack" }, createTestContext("test-monster"));

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

      const step = buildStep("CHANGE_BATTLE_POSITION", { position: "attack" }, createTestContext("nonexistent"));

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Card not found");
    });

    it("フィールド上にないカードの場合エラー", () => {
      // stateOnFieldがないカード（手札など）
      const card = {
        instanceId: "test-monster",
        id: TEST_CARD_IDS.DUMMY,
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

      const step = buildStep("CHANGE_BATTLE_POSITION", { position: "attack" }, createTestContext("test-monster"));

      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Card is not on the field");
    });
  });
});
