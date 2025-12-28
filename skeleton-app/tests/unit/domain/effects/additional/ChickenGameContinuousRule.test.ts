/**
 * ChickenGameContinuousRule Tests
 *
 * Tests for Chicken Game continuous effect (damage prevention).
 *
 * Test Responsibility:
 * - canApply() - Field existence check
 * - canApply() - LP difference check (player vs opponent)
 * - checkPermission() - Damage denial
 * - Category validation
 *
 * @module tests/unit/domain/effects/additional/ChickenGameContinuousRule
 */

import { describe, it, expect } from "vitest";
import { ChickenGameContinuousRule } from "$lib/domain/effects/additional/ChickenGameContinuousRule";
import type { GameState } from "$lib/domain/models/GameState";
import type { RuleContext } from "$lib/domain/models/RuleContext";
import type { CardInstance } from "$lib/domain/models/Zone";

describe("ChickenGameContinuousRule", () => {
  const chickenGameId = 67616300;
  const rule = new ChickenGameContinuousRule();

  describe("metadata", () => {
    it("should have correct isEffect flag", () => {
      expect(rule.isEffect).toBe(true);
    });

    it("should have correct category", () => {
      expect(rule.category).toBe("ActionPermission");
    });
  });

  describe("canApply()", () => {
    it("should return false when Chicken Game is not on field", () => {
      // Arrange
      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          field: [], // No cards on field
          graveyard: [],
          banished: [],
        },
        lp: { player: 7000, opponent: 8000 },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
      };
      const context: RuleContext = {
        damageTarget: "player",
        damageAmount: 1000,
      };

      // Act
      const result = rule.canApply(state, context);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when Chicken Game is face-down", () => {
      // Arrange
      const faceDownCard: CardInstance = {
        id: chickenGameId,
        name: "Chicken Game",
        type: "Spell",
        frameType: "spell",
        desc: "Mock card",
        race: "Field",
        instanceId: "field-0",
        location: "field",
        position: "faceDown",
      };

      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          field: [faceDownCard],
          graveyard: [],
          banished: [],
        },
        lp: { player: 7000, opponent: 8000 },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
      };
      const context: RuleContext = {
        damageTarget: "player",
        damageAmount: 1000,
      };

      // Act
      const result = rule.canApply(state, context);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when player LP >= opponent LP (damage to player)", () => {
      // Arrange
      const chickenGameCard: CardInstance = {
        id: chickenGameId,
        name: "Chicken Game",
        type: "Spell",
        frameType: "spell",
        desc: "Mock card",
        race: "Field",
        instanceId: "field-0",
        location: "field",
        position: "faceUp",
      };

      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          field: [chickenGameCard],
          graveyard: [],
          banished: [],
        },
        lp: {
          player: 8000,
          opponent: 8000, // Equal LP
        },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
      };
      const context: RuleContext = {
        damageTarget: "player",
        damageAmount: 1000,
      };

      // Act
      const result = rule.canApply(state, context);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when player LP < opponent LP (damage to player)", () => {
      // Arrange
      const chickenGameCard: CardInstance = {
        id: chickenGameId,
        name: "Chicken Game",
        type: "Spell",
        frameType: "spell",
        desc: "Mock card",
        race: "Field",
        instanceId: "field-0",
        location: "field",
        position: "faceUp",
      };

      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          field: [chickenGameCard],
          graveyard: [],
          banished: [],
        },
        lp: {
          player: 7000, // Player has less LP
          opponent: 8000,
        },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
      };
      const context: RuleContext = {
        damageTarget: "player",
        damageAmount: 1000,
      };

      // Act
      const result = rule.canApply(state, context);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when opponent LP >= player LP (damage to opponent)", () => {
      // Arrange
      const chickenGameCard: CardInstance = {
        id: chickenGameId,
        name: "Chicken Game",
        type: "Spell",
        frameType: "spell",
        desc: "Mock card",
        race: "Field",
        instanceId: "field-0",
        location: "field",
        position: "faceUp",
      };

      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          field: [chickenGameCard],
          graveyard: [],
          banished: [],
        },
        lp: {
          player: 8000,
          opponent: 8000, // Equal LP
        },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
      };
      const context: RuleContext = {
        damageTarget: "opponent",
        damageAmount: 1000,
      };

      // Act
      const result = rule.canApply(state, context);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when opponent LP < player LP (damage to opponent)", () => {
      // Arrange
      const chickenGameCard: CardInstance = {
        id: chickenGameId,
        name: "Chicken Game",
        type: "Spell",
        frameType: "spell",
        desc: "Mock card",
        race: "Field",
        instanceId: "field-0",
        location: "field",
        position: "faceUp",
      };

      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          field: [chickenGameCard],
          graveyard: [],
          banished: [],
        },
        lp: {
          player: 8000,
          opponent: 7000, // Opponent has less LP
        },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
      };
      const context: RuleContext = {
        damageTarget: "opponent",
        damageAmount: 1000,
      };

      // Act
      const result = rule.canApply(state, context);

      // Assert
      expect(result).toBe(true);
    });

    it("should default to 'player' when damageTarget is not specified", () => {
      // Arrange
      const chickenGameCard: CardInstance = {
        id: chickenGameId,
        name: "Chicken Game",
        type: "Spell",
        frameType: "spell",
        desc: "Mock card",
        race: "Field",
        instanceId: "field-0",
        location: "field",
        position: "faceUp",
      };

      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          field: [chickenGameCard],
          graveyard: [],
          banished: [],
        },
        lp: {
          player: 7000, // Player has less LP
          opponent: 8000,
        },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
      };
      const context: RuleContext = {
        damageAmount: 1000,
        // damageTarget not specified
      };

      // Act
      const result = rule.canApply(state, context);

      // Assert
      expect(result).toBe(true); // Should apply (player LP < opponent LP)
    });
  });

  describe("checkPermission()", () => {
    it("should always return false (deny damage)", () => {
      // Arrange
      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
        lp: { player: 8000, opponent: 8000 },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
      };
      const context: RuleContext = {
        damageTarget: "player",
        damageAmount: 1000,
      };

      // Act
      const result = rule.checkPermission(state, context);

      // Assert
      expect(result).toBe(false); // Damage denied
    });

    it("should deny damage regardless of context", () => {
      // Arrange
      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
        lp: { player: 8000, opponent: 8000 },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
      };
      const contexts: RuleContext[] = [
        { damageTarget: "player", damageAmount: 1000 },
        { damageTarget: "opponent", damageAmount: 2000 },
        { damageAmount: 500 },
        {},
      ];

      // Act & Assert
      contexts.forEach((context) => {
        expect(rule.checkPermission(state, context)).toBe(false);
      });
    });
  });
});
