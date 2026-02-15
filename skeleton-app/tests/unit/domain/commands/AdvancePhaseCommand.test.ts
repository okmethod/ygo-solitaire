/**
 * Unit tests for AdvancePhaseCommand
 */

import { describe, it, expect } from "vitest";
import { AdvancePhaseCommand } from "$lib/domain/commands/AdvancePhaseCommand";
import { createMockGameState, createExodiaVictoryState } from "../../../__testUtils__/gameStateFactory";

describe("AdvancePhaseCommand", () => {
  describe("canExecute", () => {
    it("should return true for Draw → Standby", () => {
      const state = createMockGameState({
        phase: "draw",
        space: {
          mainDeck: [
            {
              instanceId: "main-0",
              id: 12345678,
              jaName: "サンプルモンスター",
              type: "monster" as const,
              frameType: "normal" as const,
              location: "mainDeck" as const,
            },
          ],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(true);
    });

    it("should return true for Standby → Main1", () => {
      const state = createMockGameState({ phase: "standby" });
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(true);
    });

    it("should return true for Main1 → End", () => {
      const state = createMockGameState({ phase: "main1" });
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(true);
    });

    it("should return true for End → End (循環)", () => {
      const state = createMockGameState({ phase: "end" });
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(true);
    });

    it("should return false when game is already over", () => {
      const state = createExodiaVictoryState();
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("should advance from Draw to Standby", () => {
      const state = createMockGameState({
        phase: "draw",
        space: {
          mainDeck: [
            {
              instanceId: "main-0",
              id: 12345678,
              jaName: "サンプルモンスター",
              type: "monster" as const,
              frameType: "normal" as const,
              location: "mainDeck" as const,
            },
          ],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.phase).toBe("standby");
      expect(result.message).toContain("スタンバイフェイズ");
    });

    it("should advance from Standby to Main1", () => {
      const state = createMockGameState({ phase: "standby" });
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.phase).toBe("main1");
      expect(result.message).toContain("メインフェイズ");
    });

    it("should advance from Main1 to End", () => {
      const state = createMockGameState({ phase: "main1" });
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.phase).toBe("end");
      expect(result.message).toContain("エンドフェイズ");
    });

    it("should stay at End phase when advancing from End", () => {
      const state = createMockGameState({ phase: "end" });
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.phase).toBe("end");
    });

    it("should not mutate original state (immutability)", () => {
      const state = createMockGameState({ phase: "draw" });
      const originalPhase = state.phase;
      const command = new AdvancePhaseCommand();

      command.execute(state);

      // Original state should remain unchanged
      expect(state.phase).toBe(originalPhase);
    });

    it("should fail when game is already over", () => {
      const state = createExodiaVictoryState();
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(false);
      expect(result.updatedState).toBe(state);
    });
  });

  describe("getNextPhase", () => {
    it("should return Standby for Draw phase", () => {
      const state = createMockGameState({ phase: "draw" });
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("standby");
    });

    it("should return Main1 for Standby phase", () => {
      const state = createMockGameState({ phase: "standby" });
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("main1");
    });

    it("should return End for Main1 phase", () => {
      const state = createMockGameState({ phase: "main1" });
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("end");
    });

    it("should return End for End phase", () => {
      const state = createMockGameState({ phase: "end" });
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("end");
    });
  });

  describe("description", () => {
    it("should have correct description", () => {
      const command = new AdvancePhaseCommand();

      expect(command.description).toBe("Advance to next phase");
    });
  });
});
