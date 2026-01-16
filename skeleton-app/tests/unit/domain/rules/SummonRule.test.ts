import { describe, it, expect } from "vitest";
import { canNormalSummon } from "$lib/domain/rules/SummonRule";
import { createMockGameState } from "../../../__testUtils__/gameStateFactory";
import { ValidationErrorCode } from "$lib/domain/models/ValidationResult";

describe("SummonRule", () => {
  describe("canNormalSummon", () => {
    it("should allow summon when conditions are met", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = canNormalSummon(state);

      // Assert
      expect(result.canExecute).toBe(true);
      expect(result.errorCode).toBeUndefined();
    });

    it("should fail if not in Main1 phase", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Draw",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
      });

      // Act
      const result = canNormalSummon(state);

      // Assert
      expect(result.canExecute).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCode.NOT_MAIN_PHASE);
    });

    it("should fail if summon limit reached", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 1,
      });

      // Act
      const result = canNormalSummon(state);

      // Assert
      expect(result.canExecute).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCode.SUMMON_LIMIT_REACHED);
    });

    it("should fail if mainMonsterZone is full (5 cards)", () => {
      // Arrange
      const fullMonsterZone = Array.from({ length: 5 }, (_, i) => ({
        instanceId: `monster-${i}`,
        id: 1000 + i,
        name: `Monster ${i}`,
        jaName: `モンスター ${i}`,
        type: "monster" as const,
        frameType: "normal" as const,
        desc: "Test monster",
        atk: 1000,
        def: 1000,
        level: 4,
        race: "Warrior",
        attribute: "LIGHT",
        location: "mainMonsterZone" as const,
        position: "faceUp" as const,
        battlePosition: "attack" as const,
        placedThisTurn: false,
      }));

      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: fullMonsterZone,
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = canNormalSummon(state);

      // Assert
      expect(result.canExecute).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCode.MONSTER_ZONE_FULL);
    });

    it("should allow summon if normalSummonLimit is 2 and used is 0", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 2,
        normalSummonUsed: 0,
      });

      // Act
      const result = canNormalSummon(state);

      // Assert
      expect(result.canExecute).toBe(true);
    });

    it("should allow summon if normalSummonLimit is 2 and used is 1", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 2,
        normalSummonUsed: 1,
      });

      // Act
      const result = canNormalSummon(state);

      // Assert
      expect(result.canExecute).toBe(true);
    });

    it("should fail if normalSummonLimit is 2 and used is 2", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 2,
        normalSummonUsed: 2,
      });

      // Act
      const result = canNormalSummon(state);

      // Assert
      expect(result.canExecute).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCode.SUMMON_LIMIT_REACHED);
    });

    it("should allow summon when mainMonsterZone has 4 cards", () => {
      // Arrange
      const monsterZone = Array.from({ length: 4 }, (_, i) => ({
        instanceId: `monster-${i}`,
        id: 1000 + i,
        name: `Monster ${i}`,
        jaName: `モンスター ${i}`,
        type: "monster" as const,
        frameType: "normal" as const,
        desc: "Test monster",
        atk: 1000,
        def: 1000,
        level: 4,
        race: "Warrior",
        attribute: "LIGHT",
        location: "mainMonsterZone" as const,
        position: "faceUp" as const,
        battlePosition: "attack" as const,
        placedThisTurn: false,
      }));

      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: monsterZone,
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = canNormalSummon(state);

      // Assert
      expect(result.canExecute).toBe(true);
    });
  });
});
