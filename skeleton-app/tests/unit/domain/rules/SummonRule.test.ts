import { describe, it, expect } from "vitest";
import {
  canNormalSummon,
  getRequiredTributes,
  performNormalSummon,
  canSpecialSummon,
  executeSpecialSummon,
} from "$lib/domain/rules/SummonRule";
import { createMockGameState, createMonsterInstance, createMonstersOnField } from "../../../__testUtils__";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

describe("SummonRule", () => {
  describe("getRequiredTributes", () => {
    it("should return 0 for level 4 or below", () => {
      expect(getRequiredTributes(1)).toBe(0);
      expect(getRequiredTributes(4)).toBe(0);
      expect(getRequiredTributes(undefined)).toBe(0);
    });

    it("should return 1 for level 5-6", () => {
      expect(getRequiredTributes(5)).toBe(1);
      expect(getRequiredTributes(6)).toBe(1);
    });

    it("should return 2 for level 7 or above", () => {
      expect(getRequiredTributes(7)).toBe(2);
      expect(getRequiredTributes(12)).toBe(2);
    });
  });

  describe("canSummonOrSet", () => {
    it("should allow summon when conditions are met (level 4 monster)", () => {
      // Arrange
      const monster = createMonsterInstance("test-monster", { level: 4 });
      const state = createMockGameState({
        space: { hand: [monster] },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errorCode).toBeUndefined();
    });

    it("should fail if not in Main phase", () => {
      // Arrange
      const monster = createMonsterInstance("test-monster", { level: 4 });
      const state = createMockGameState({
        phase: "draw",
        space: { hand: [monster] },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
    });

    it("should fail if summon limit reached", () => {
      // Arrange
      const monster = createMonsterInstance("test-monster", { level: 4 });
      const state = createMockGameState({
        normalSummonUsed: 1,
        space: { hand: [monster] },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.SUMMON_LIMIT_REACHED);
    });

    it("should fail if mainMonsterZone is full (5 cards) for normal summon", () => {
      // Arrange
      const monster = createMonsterInstance("test-monster", { level: 4 });
      const state = createMockGameState({
        space: {
          hand: [monster],
          mainMonsterZone: createMonstersOnField(5),
        },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.MONSTER_ZONE_FULL);
    });

    it("should fail if card is not in hand", () => {
      // Arrange
      const monster = createMonsterInstance("test-monster", { location: "mainMonsterZone", level: 4 });
      const state = createMockGameState({
        space: { mainMonsterZone: [monster] },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.CARD_NOT_IN_HAND);
    });

    it("should allow tribute summon when field has enough monsters (level 5)", () => {
      // Arrange
      const monster = createMonsterInstance("high-level-monster", { level: 5 });
      const state = createMockGameState({
        space: {
          hand: [monster],
          mainMonsterZone: createMonstersOnField(1),
        },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should fail tribute summon when field has not enough monsters (level 7)", () => {
      // Arrange
      const monster = createMonsterInstance("high-level-monster", { level: 7 });
      const state = createMockGameState({
        space: {
          hand: [monster],
          mainMonsterZone: createMonstersOnField(1), // Only 1, but need 2
        },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.NOT_ENOUGH_TRIBUTES);
    });
  });

  describe("performNormalSummon", () => {
    describe("no tribute required (level 4 or below)", () => {
      it("should return immediate result with updated state when summoning in attack position", () => {
        // Arrange
        const monster = createMonsterInstance("test-monster", { level: 4 });
        const state = createMockGameState({
          space: { hand: [monster] },
        });

        // Act
        const result = performNormalSummon(state, monster.instanceId, "attack");

        // Assert
        expect(result.type).toBe("immediate");
        if (result.type === "immediate") {
          expect(result.state.normalSummonUsed).toBe(1);
          expect(result.state.space.mainMonsterZone.length).toBe(1);
          expect(result.state.space.hand.length).toBe(0);
          expect(result.message).toContain("召喚");
          expect(result.activationSteps.length).toBe(1); // emitNormalSummonedEventStep
        }
      });

      it("should return immediate result when setting in defense position", () => {
        // Arrange
        const monster = createMonsterInstance("test-monster", { level: 4 });
        const state = createMockGameState({
          space: { hand: [monster] },
        });

        // Act
        const result = performNormalSummon(state, monster.instanceId, "defense");

        // Assert
        expect(result.type).toBe("immediate");
        if (result.type === "immediate") {
          expect(result.state.normalSummonUsed).toBe(1);
          expect(result.message).toContain("セット");
          expect(result.activationSteps.length).toBe(0); // No event for set
        }
      });

      it("should place monster face up in attack position", () => {
        // Arrange
        const monster = createMonsterInstance("test-monster", { level: 4 });
        const state = createMockGameState({
          space: { hand: [monster] },
        });

        // Act
        const result = performNormalSummon(state, monster.instanceId, "attack");

        // Assert
        if (result.type === "immediate") {
          const summonedMonster = result.state.space.mainMonsterZone[0];
          expect(summonedMonster.stateOnField?.position).toBe("faceUp");
          expect(summonedMonster.stateOnField?.battlePosition).toBe("attack");
        }
      });

      it("should place monster face down in defense position", () => {
        // Arrange
        const monster = createMonsterInstance("test-monster", { level: 4 });
        const state = createMockGameState({
          space: { hand: [monster] },
        });

        // Act
        const result = performNormalSummon(state, monster.instanceId, "defense");

        // Assert
        if (result.type === "immediate") {
          const summonedMonster = result.state.space.mainMonsterZone[0];
          expect(summonedMonster.stateOnField?.position).toBe("faceDown");
          expect(summonedMonster.stateOnField?.battlePosition).toBe("defense");
        }
      });
    });

    describe("tribute required (level 5 or above)", () => {
      it("should return needsSelection result for level 5 monster", () => {
        // Arrange
        const monster = createMonsterInstance("high-level-monster", { level: 5 });
        const state = createMockGameState({
          space: {
            hand: [monster],
            mainMonsterZone: createMonstersOnField(1),
          },
        });

        // Act
        const result = performNormalSummon(state, monster.instanceId, "attack");

        // Assert
        expect(result.type).toBe("needsSelection");
        if (result.type === "needsSelection") {
          expect(result.step).toBeDefined();
          expect(result.message).toContain("リリース");
        }
      });

      it("should return needsSelection result for level 7 monster (2 tributes)", () => {
        // Arrange
        const monster = createMonsterInstance("high-level-monster", { level: 7 });
        const state = createMockGameState({
          space: {
            hand: [monster],
            mainMonsterZone: createMonstersOnField(2),
          },
        });

        // Act
        const result = performNormalSummon(state, monster.instanceId, "attack");

        // Assert
        expect(result.type).toBe("needsSelection");
        if (result.type === "needsSelection") {
          expect(result.step).toBeDefined();
        }
      });
    });
  });

  describe("canSpecialSummon", () => {
    it("should return success when monster zone is not full", () => {
      // Arrange
      const state = createMockGameState();

      // Act
      const result = canSpecialSummon(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should return success when monster zone has 4 monsters", () => {
      // Arrange
      const state = createMockGameState({
        space: { mainMonsterZone: createMonstersOnField(4) },
      });

      // Act
      const result = canSpecialSummon(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should return MONSTER_ZONE_FULL when monster zone is full (5 monsters)", () => {
      // Arrange
      const state = createMockGameState({
        space: { mainMonsterZone: createMonstersOnField(5) },
      });

      // Act
      const result = canSpecialSummon(state);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.MONSTER_ZONE_FULL);
    });
  });

  describe("executeSpecialSummon", () => {
    it("should move monster from hand to monster zone in attack position", () => {
      // Arrange
      const monster = createMonsterInstance("test-monster", { level: 4 });
      const state = createMockGameState({
        space: { hand: [monster] },
      });

      // Act
      const { state: result, event } = executeSpecialSummon(state, monster.instanceId, "attack");

      // Assert
      expect(result.space.hand.length).toBe(0);
      expect(result.space.mainMonsterZone.length).toBe(1);
      const summonedMonster = result.space.mainMonsterZone[0];
      expect(summonedMonster.stateOnField?.position).toBe("faceUp");
      expect(summonedMonster.stateOnField?.battlePosition).toBe("attack");
      expect(event.type).toBe("specialSummoned");
      expect(event.sourceInstanceId).toBe(monster.instanceId);
    });

    it("should move monster from hand to monster zone in defense position", () => {
      // Arrange
      const monster = createMonsterInstance("test-monster", { level: 4 });
      const state = createMockGameState({
        space: { hand: [monster] },
      });

      // Act
      const { state: result } = executeSpecialSummon(state, monster.instanceId, "defense");

      // Assert
      const summonedMonster = result.space.mainMonsterZone[0];
      expect(summonedMonster.stateOnField?.position).toBe("faceUp"); // Special summon is always face up
      expect(summonedMonster.stateOnField?.battlePosition).toBe("defense");
    });

    it("should move monster from extra deck to monster zone", () => {
      // Arrange
      const synchro = createMonsterInstance("synchro-monster", {
        frameType: "synchro",
        level: 6,
        location: "extraDeck",
      });
      const state = createMockGameState({
        space: { extraDeck: [synchro] },
      });

      // Act
      const { state: result } = executeSpecialSummon(state, synchro.instanceId, "attack");

      // Assert
      expect(result.space.extraDeck.length).toBe(0);
      expect(result.space.mainMonsterZone.length).toBe(1);
    });

    it("should not consume normal summon right", () => {
      // Arrange
      const monster = createMonsterInstance("test-monster", { level: 4 });
      const state = createMockGameState({
        normalSummonUsed: 0,
        space: { hand: [monster] },
      });

      // Act
      const { state: result } = executeSpecialSummon(state, monster.instanceId, "attack");

      // Assert
      expect(result.normalSummonUsed).toBe(0); // Should remain 0
    });
  });
});
