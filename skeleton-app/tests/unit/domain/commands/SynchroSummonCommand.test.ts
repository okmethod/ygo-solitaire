/**
 * SynchroSummonCommand Tests
 *
 * シンクロ召喚コマンドのテスト。
 * canExecuteとexecuteの動作を検証する。
 *
 * @module tests/unit/domain/commands/SynchroSummonCommand
 */

import { describe, it, expect } from "vitest";
import { SynchroSummonCommand } from "$lib/domain/commands/SynchroSummonCommand";
import {
  createSynchroSummonReadyState,
  createSynchroSummonNoTunerState,
  createSynchroSummonLevelMismatchState,
} from "../../../__testUtils__";

describe("SynchroSummonCommand", () => {
  describe("constructor", () => {
    it("should create command with card instance id", () => {
      // Arrange & Act
      const command = new SynchroSummonCommand("synchro-0");

      // Assert
      expect(command.getCardInstanceId()).toBe("synchro-0");
      expect(command.description).toContain("synchro-0");
    });
  });

  describe("canExecute", () => {
    it("should return false when game is over", () => {
      // Arrange
      const state = createSynchroSummonReadyState();
      const gameOverState = {
        ...state,
        result: {
          isGameOver: true,
          winner: "player" as const,
          reason: "exodia" as const,
        },
      };
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(gameOverState);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("GAME_OVER");
    });

    it("should return false when not in main phase", () => {
      // Arrange
      const state = createSynchroSummonReadyState();
      const drawPhaseState = { ...state, phase: "draw" as const };
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(drawPhaseState);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NOT_MAIN_PHASE");
    });

    it("should return false when card not found", () => {
      // Arrange
      const state = createSynchroSummonReadyState();
      const command = new SynchroSummonCommand("non-existent");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("CARD_NOT_FOUND");
    });

    it("should return false when no tuner on field", () => {
      // Arrange
      const state = createSynchroSummonNoTunerState();
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
    });

    it("should return false when level sum does not match (level mismatch)", () => {
      // Arrange
      const state = createSynchroSummonLevelMismatchState();
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
    });

    it("should return true when synchro materials are valid", () => {
      // Arrange: Tuner Lv2 + NonTuner Lv4 = Lv6 Synchro
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should return true with multiple non-tuners summing to correct level", () => {
      // Arrange: Tuner Lv2 + NonTuner Lv2 + NonTuner Lv3 = Lv7 Synchro
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [2, 3],
        synchroLevel: 7,
      });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  describe("execute", () => {
    it("should return failure when canExecute fails", () => {
      // Arrange
      const state = createSynchroSummonNoTunerState();
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should return success with material selection step when valid", () => {
      // Arrange
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.activationSteps).toBeDefined();
      expect(result.activationSteps?.length).toBe(1);
      expect(result.activationSteps?.[0].summary).toContain("シンクロ素材");
    });

    it("should return the current state (not modified until selection completes)", () => {
      // Arrange
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.execute(state);

      // Assert - updatedState is a new object from checkVictory, so use toStrictEqual
      expect(result.updatedState).toStrictEqual(state);
    });
  });
});
