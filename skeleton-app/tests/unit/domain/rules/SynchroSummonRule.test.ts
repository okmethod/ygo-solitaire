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
} from "../../../__testUtils__";

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

    describe("material selection callback", () => {
      it("should return failure when selection is cancelled (empty selection)", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");

        // Act - call the action with empty selection (cancel)
        const updateResult = result.step.action(state, []);

        // Assert
        expect(updateResult.success).toBe(false);
        expect(updateResult.error).toContain("キャンセル");
      });

      it("should send materials to graveyard and summon synchro monster on valid selection", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");

        // Act - select the tuner and non-tuner
        const updateResult = result.step.action(state, ["tuner-0", "nontuner-0"]);

        // Assert
        expect(updateResult.success).toBe(true);
        expect(updateResult.message).toContain("シンクロ召喚");

        // Verify materials are sent to graveyard
        const graveyardCards = updateResult.updatedState.space.graveyard;
        expect(graveyardCards.some((c) => c.instanceId === "tuner-0")).toBe(true);
        expect(graveyardCards.some((c) => c.instanceId === "nontuner-0")).toBe(true);

        // Verify synchro monster is on the field
        const fieldMonsters = updateResult.updatedState.space.mainMonsterZone;
        const synchro = fieldMonsters.find((c) => c.instanceId === "synchro-0");
        expect(synchro).toBeDefined();
        expect(synchro?.stateOnField?.position).toBe("faceUp");
        expect(synchro?.stateOnField?.battlePosition).toBe("attack");
      });

      it("should emit sentToGraveyard and synchroSummoned events", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");

        // Act
        const updateResult = result.step.action(state, ["tuner-0", "nontuner-0"]);

        // Assert
        expect(updateResult.emittedEvents).toBeDefined();
        expect(updateResult.emittedEvents?.some((e) => e.type === "sentToGraveyard")).toBe(true);
        expect(updateResult.emittedEvents?.some((e) => e.type === "synchroSummoned")).toBe(true);
      });
    });

    describe("canConfirm validation", () => {
      it("should have canConfirm function that validates material selection", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");

        // Assert - step should have cardSelectionConfig with canConfirm
        expect(result.step.cardSelectionConfig).toBeDefined();
        expect(result.step.cardSelectionConfig!(state)?.canConfirm).toBeDefined();
      });

      it("canConfirm should return false for single card selection", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;
        const tuner = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;

        // Act & Assert
        expect(canConfirm([tuner])).toBe(false);
      });

      it("canConfirm should return false for tuner-only selection", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        // Add another tuner for this test
        const tuner1 = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;
        const tuner2 = { ...tuner1, instanceId: "tuner-1" };

        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;

        // Act & Assert - two tuners, no non-tuner
        expect(canConfirm([tuner1, tuner2])).toBe(false);
      });

      it("canConfirm should return false for wrong level total", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [3], // 2+3=5, but synchro is Lv6
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;
        const tuner = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;
        const nonTuner = state.space.mainMonsterZone.find((c) => c.instanceId === "nontuner-0")!;

        // Act & Assert
        expect(canConfirm([tuner, nonTuner])).toBe(false);
      });

      it("canConfirm should return true for valid material selection", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;
        const tuner = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;
        const nonTuner = state.space.mainMonsterZone.find((c) => c.instanceId === "nontuner-0")!;

        // Act & Assert
        expect(canConfirm([tuner, nonTuner])).toBe(true);
      });

      it("canConfirm should return true for multiple non-tuners with correct level", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 1,
          nonTunerLevels: [2, 2], // 1+2+2=5
          synchroLevel: 5,
        });
        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;
        const tuner = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;
        const nonTuner0 = state.space.mainMonsterZone.find((c) => c.instanceId === "nontuner-0")!;
        const nonTuner1 = state.space.mainMonsterZone.find((c) => c.instanceId === "nontuner-1")!;

        // Act & Assert
        expect(canConfirm([tuner, nonTuner0, nonTuner1])).toBe(true);
      });
    });
  });
});
