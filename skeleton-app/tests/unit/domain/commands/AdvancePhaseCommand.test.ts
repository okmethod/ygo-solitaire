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
        phase: "Draw",
        zones: {
          deck: [
            {
              instanceId: "deck-0",
              id: 12345678,
              jaName: "サンプルモンスター",
              type: "monster" as const,
              frameType: "normal" as const,
              location: "deck" as const,
              placedThisTurn: false,
            },
          ],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state)).toBe(true);
    });

    it("should return true for Standby → Main1", () => {
      const state = createMockGameState({ phase: "Standby" });
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state)).toBe(true);
    });

    it("should return true for Main1 → End", () => {
      const state = createMockGameState({ phase: "Main1" });
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state)).toBe(true);
    });

    it("should return true for End → End (循環)", () => {
      const state = createMockGameState({ phase: "End" });
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state)).toBe(true);
    });

    it("should return false when game is already over", () => {
      const state = createExodiaVictoryState();
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state)).toBe(false);
    });
  });

  describe("execute", () => {
    it("should advance from Draw to Standby", () => {
      const state = createMockGameState({
        phase: "Draw",
        zones: {
          deck: [
            {
              instanceId: "deck-0",
              id: 12345678,
              jaName: "サンプルモンスター",
              type: "monster" as const,
              frameType: "normal" as const,
              location: "deck" as const,
              placedThisTurn: false,
            },
          ],
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
      expect(result.newState.phase).toBe("Standby");
      expect(result.message).toContain("スタンバイフェイズ");
    });

    it("should advance from Standby to Main1", () => {
      const state = createMockGameState({ phase: "Standby" });
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.newState.phase).toBe("Main1");
      expect(result.message).toContain("メインフェイズ");
    });

    it("should advance from Main1 to End", () => {
      const state = createMockGameState({ phase: "Main1" });
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.newState.phase).toBe("End");
      expect(result.message).toContain("エンドフェイズ");
    });

    it("should stay at End phase when advancing from End", () => {
      const state = createMockGameState({ phase: "End" });
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.newState.phase).toBe("End");
    });

    it("should not mutate original state (immutability)", () => {
      const state = createMockGameState({ phase: "Draw" });
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
      expect(result.newState).toBe(state);
    });
  });

  describe("getNextPhase", () => {
    it("should return Standby for Draw phase", () => {
      const state = createMockGameState({ phase: "Draw" });
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("Standby");
    });

    it("should return Main1 for Standby phase", () => {
      const state = createMockGameState({ phase: "Standby" });
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("Main1");
    });

    it("should return End for Main1 phase", () => {
      const state = createMockGameState({ phase: "Main1" });
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("End");
    });

    it("should return End for End phase", () => {
      const state = createMockGameState({ phase: "End" });
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("End");
    });
  });

  describe("description", () => {
    it("should have correct description", () => {
      const command = new AdvancePhaseCommand();

      expect(command.description).toBe("Advance to next phase");
    });
  });
});
