import { describe, it, expect } from "vitest";
import { canNormalSummon, getRequiredTributes } from "$lib/domain/rules/SummonRule";
import { createMockGameState, createTestMonsterCard } from "../../../__testUtils__/gameStateFactory";
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
      const monster = {
        ...createTestMonsterCard("test-monster"),
        level: 4,
        location: "hand" as const,
      };
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [monster],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errorCode).toBeUndefined();
    });

    it("should fail if not in Main phase", () => {
      // Arrange
      const monster = {
        ...createTestMonsterCard("test-monster"),
        level: 4,
        location: "hand" as const,
      };
      const state = createMockGameState({
        phase: "draw",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [monster],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
    });

    it("should fail if summon limit reached", () => {
      // Arrange
      const monster = {
        ...createTestMonsterCard("test-monster"),
        level: 4,
        location: "hand" as const,
      };
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 1,
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [monster],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.SUMMON_LIMIT_REACHED);
    });

    it("should fail if mainMonsterZone is full (5 cards) for normal summon", () => {
      // Arrange
      const monster = {
        ...createTestMonsterCard("test-monster"),
        level: 4,
        location: "hand" as const,
      };
      const fullMonsterZone = Array.from({ length: 5 }, (_, i) => ({
        ...createTestMonsterCard(`monster-${i}`),
        location: "mainMonsterZone" as const,
      }));

      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [monster],
          mainMonsterZone: fullMonsterZone,
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
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
      const monster = {
        ...createTestMonsterCard("test-monster"),
        level: 4,
        location: "mainMonsterZone" as const,
      };
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [monster],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.CARD_NOT_IN_HAND);
    });

    it("should allow tribute summon when field has enough monsters (level 5)", () => {
      // Arrange
      const monster = {
        ...createTestMonsterCard("high-level-monster"),
        level: 5,
        location: "hand" as const,
      };
      const tribute = {
        ...createTestMonsterCard("tribute-monster"),
        level: 4,
        location: "mainMonsterZone" as const,
      };
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [monster],
          mainMonsterZone: [tribute],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should fail tribute summon when field has not enough monsters (level 7)", () => {
      // Arrange
      const monster = {
        ...createTestMonsterCard("high-level-monster"),
        level: 7,
        location: "hand" as const,
      };
      const tribute = {
        ...createTestMonsterCard("tribute-monster"),
        level: 4,
        location: "mainMonsterZone" as const,
      };
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [monster],
          mainMonsterZone: [tribute], // Only 1, but need 2
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = canNormalSummon(state, monster.instanceId);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.NOT_ENOUGH_TRIBUTES);
    });
  });
});
