/**
 * ChickenGameActivation Tests
 *
 * Tests for ChickenGameActivation ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase, Field spell zone)
 * - createActivationSteps() returns empty array (no activation cost)
 * - createResolutionSteps() returns empty array (field spell stays on field)
 *
 * @module tests/unit/domain/effects/chainable/ChickenGameActivation
 */

import { describe, it, expect } from "vitest";
import { ChickenGameActivation } from "$lib/domain/effects/actions/spell/ChickenGameActivation";
import { createMockGameState } from "../../../../../__testUtils__/gameStateFactory";
import type { CardInstance } from "$lib/domain/models/Card";

describe("ChickenGameActivation", () => {
  const action = new ChickenGameActivation();

  describe("ChainableAction interface properties", () => {
    it("should be a card activation", () => {
      expect(action.isCardActivation).toBe(true);
    });

    it("should have spell speed 1", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met", () => {
      // Arrange: Game not over, Main Phase 1, No field spell
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [],
          field: [], // No field spell
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(true);
    });

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const state = createMockGameState({
        phase: "Main1",
        result: {
          isGameOver: true,
          winner: "player",
          reason: "exodia",
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw
      const state = createMockGameState({
        phase: "Draw",
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when phase is Standby", () => {
      // Arrange: Phase is Standby
      const state = createMockGameState({
        phase: "Standby",
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when 2 or more field spells already exist", () => {
      // Arrange: Two field spells on field
      const fieldSpell1: CardInstance = {
        instanceId: "field-0",
        id: 99999999, // Another field spell
        type: "spell",
        frameType: "spell",
        spellType: "field",
        location: "field",
        position: "faceUp",
      };
      const fieldSpell2: CardInstance = {
        instanceId: "field-1",
        id: 88888888, // Another field spell
        type: "spell",
        frameType: "spell",
        spellType: "field",
        location: "field",
        position: "faceUp",
      };

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [],
          field: [fieldSpell1, fieldSpell2],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return true when only non-field spells are on field", () => {
      // Arrange: Normal spell on field (not field spell)
      const normalSpell: CardInstance = {
        instanceId: "field-0",
        id: 55144522, // Pot of Greed
        type: "spell",
        frameType: "spell",
        spellType: "normal",
        location: "field",
        position: "faceUp",
      };

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [],
          field: [normalSpell],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(true);
    });

    it("should return true when 1 field spell is on field (activating card)", () => {
      // Arrange: Chicken Game already on field (activating card)
      const chickenGame: CardInstance = {
        instanceId: "field-0",
        id: 67616300,
        type: "spell",
        frameType: "spell",
        spellType: "field",
        location: "field",
        position: "faceUp",
      };

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [],
          field: [chickenGame],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return empty array (no activation cost)", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
      });

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toEqual([]);
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return empty array (field spell stays on field)", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
      });
      const cardInstanceId = "field-0";

      // Act
      const steps = action.createResolutionSteps(state, cardInstanceId);

      // Assert
      expect(steps).toEqual([]);
    });
  });
});
