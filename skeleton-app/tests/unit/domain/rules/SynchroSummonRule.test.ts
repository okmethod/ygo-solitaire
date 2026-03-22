/**
 * SynchroSummonRule Tests
 *
 * シンクロ召喚ルールのテスト。
 * canSynchroSummonとperformSynchroSummonの動作を検証する。
 *
 * @module tests/unit/domain/rules/SynchroSummonRule
 */

import { describe, it, expect } from "vitest";
import { canSynchroSummon, performSynchroSummon } from "$lib/domain/rules/SynchroSummonRule";
import {
  createMockGameState,
  createSynchroSummonReadyState,
  createSynchroSummonNoTunerState,
  createSynchroSummonLevelMismatchState,
  createTestSynchroMonster,
  createTestTunerCard,
  createFieldCardInstance,
  createCardInstances,
  SYNCHRO_TEST_CARD_IDS,
} from "../../../__testUtils__/gameStateFactory";

describe("SynchroSummonRule", () => {
  describe("canSynchroSummon", () => {
    describe("phase validation", () => {
      it("should return NOT_MAIN_PHASE when in draw phase", () => {
        // Arrange
        const state = createSynchroSummonReadyState();
        const drawState = { ...state, phase: "draw" as const };

        // Act
        const result = canSynchroSummon(drawState, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NOT_MAIN_PHASE");
      });

      it("should pass when in main1 phase", () => {
        // Arrange
        const state = createSynchroSummonReadyState();

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(true);
      });
    });

    describe("card validation", () => {
      it("should return CARD_NOT_FOUND when card does not exist", () => {
        // Arrange
        const state = createSynchroSummonReadyState();

        // Act
        const result = canSynchroSummon(state, "non-existent");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("CARD_NOT_FOUND");
      });

      it("should return NOT_SYNCHRO_MONSTER when card is not synchro", () => {
        // Arrange
        const state = createMockGameState({
          space: {
            extraDeck: [
              {
                instanceId: "fusion-0",
                id: 99999999,
                jaName: "Test Fusion",
                type: "monster",
                frameType: "fusion", // Not synchro
                edition: "latest",
                location: "extraDeck",
              },
            ],
            mainMonsterZone: [createTestTunerCard("tuner-0", 2, { location: "mainMonsterZone" })],
          },
          phase: "main1",
        });

        // Act
        const result = canSynchroSummon(state, "fusion-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NOT_SYNCHRO_MONSTER");
      });

      it("should return CARD_NOT_IN_EXTRA_DECK when synchro is not in extra deck", () => {
        // Arrange
        const state = createMockGameState({
          space: {
            hand: [createTestSynchroMonster("synchro-0", 6, { location: "hand" })],
            mainMonsterZone: [createTestTunerCard("tuner-0", 2, { location: "mainMonsterZone" })],
          },
          phase: "main1",
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("CARD_NOT_IN_EXTRA_DECK");
      });
    });

    describe("material validation", () => {
      it("should return NO_VALID_SYNCHRO_MATERIALS when no tuner", () => {
        // Arrange
        const state = createSynchroSummonNoTunerState();

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
      });

      it("should return NO_VALID_SYNCHRO_MATERIALS when no non-tuner", () => {
        // Arrange: Only tuner on field, no non-tuner
        const state = createMockGameState({
          space: {
            extraDeck: [createTestSynchroMonster("synchro-0", 6, { location: "extraDeck" })],
            mainMonsterZone: [createTestTunerCard("tuner-0", 2, { location: "mainMonsterZone" })],
            mainDeck: createCardInstances(Array(30).fill(12345678), "mainDeck"),
          },
          phase: "main1",
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
      });

      it("should return NO_VALID_SYNCHRO_MATERIALS when levels do not match", () => {
        // Arrange
        const state = createSynchroSummonLevelMismatchState();

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
      });

      it("should return success with valid materials (Tuner Lv2 + NonTuner Lv4 = Lv6)", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(true);
      });

      it("should return success with multiple non-tuners (Tuner Lv1 + NonTuner Lv2 + NonTuner Lv2 = Lv5)", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 1,
          nonTunerLevels: [2, 2],
          synchroLevel: 5,
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(true);
      });

      it("should return success with Tuner Lv3 + NonTuner Lv4 = Lv7", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 3,
          nonTunerLevels: [4],
          synchroLevel: 7,
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(true);
      });
    });

    describe("face-down monster handling", () => {
      it("should ignore face-down monsters as materials", () => {
        // Arrange: Tuner is face-down
        const state = createMockGameState({
          space: {
            extraDeck: [createTestSynchroMonster("synchro-0", 6, { location: "extraDeck" })],
            mainMonsterZone: [
              createFieldCardInstance({
                instanceId: "tuner-0",
                id: SYNCHRO_TEST_CARD_IDS.TUNER_LV2,
                jaName: "Test Tuner Lv2",
                type: "monster",
                frameType: "effect",
                location: "mainMonsterZone",
                position: "faceDown", // Face-down
              }),
              createFieldCardInstance({
                instanceId: "nontuner-0",
                id: SYNCHRO_TEST_CARD_IDS.NON_TUNER_LV4,
                jaName: "Test NonTuner Lv4",
                type: "monster",
                frameType: "normal",
                location: "mainMonsterZone",
                position: "faceUp",
              }),
            ],
            mainDeck: createCardInstances(Array(30).fill(12345678), "mainDeck"),
          },
          phase: "main1",
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
      });
    });
  });

  describe("performSynchroSummon", () => {
    it("should return material selection step", () => {
      // Arrange
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });

      // Act
      const result = performSynchroSummon(state, "synchro-0");

      // Assert
      expect(result.type).toBe("needsSelection");
      expect(result.step).toBeDefined();
      expect(result.step.summary).toContain("シンクロ素材");
    });

    it("should include synchro monster name in message", () => {
      // Arrange
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });

      // Act
      const result = performSynchroSummon(state, "synchro-0");

      // Assert
      expect(result.message).toContain("Test Synchro Lv6");
    });

    it("should create a cancelable selection step", () => {
      // Arrange
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });

      // Act
      const result = performSynchroSummon(state, "synchro-0");

      // Assert - the step should have properties for selection
      expect(result.step.id).toContain("select-synchro-materials");
    });
  });
});
