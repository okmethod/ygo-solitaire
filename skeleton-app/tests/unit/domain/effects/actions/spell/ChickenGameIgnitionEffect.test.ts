/**
 * ChickenGameIgnitionEffect Tests
 *
 * Tests for ChickenGameIgnitionEffect ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase, LP, 1ターンに1度制限, Card on field)
 * - createActivationSteps() returns 2 steps (Pay LP, Record activation)
 * - createResolutionSteps() returns 1 step (Draw 1 card)
 * - Each step's action correctly updates GameState
 * - 1ターンに1度制限が正しく動作すること
 *
 * @module tests/unit/domain/effects/chainable/ChickenGameIgnitionEffect
 */

import { describe, it, expect } from "vitest";
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/spell/ChickenGameIgnitionEffect";
import { createMockGameState } from "../../../../../__testUtils__/gameStateFactory";
import type { CardInstance } from "$lib/domain/models/Card";

describe("ChickenGameIgnitionEffect", () => {
  const cardInstanceId = "field-0";
  const chickenGame: CardInstance = {
    instanceId: cardInstanceId,
    id: 67616300, // Chicken Game
    type: "spell",
    frameType: "spell",
    spellType: "field",
    location: "field",
    position: "faceUp",
  };

  describe("ChainableAction interface properties", () => {
    it("should not be a card activation (effect activation)", () => {
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      expect(action.isCardActivation).toBe(false);
    });

    it("should have spell speed 1", () => {
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met", () => {
      // Arrange: Game not over, Main Phase 1, LP >= 1000, Not activated, Chicken Game on field
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        lp: {
          player: 8000,
          opponent: 8000,
        },
        zones: {
          deck: [
            {
              instanceId: "deck-0",
              id: 1001,
              type: "spell",
              frameType: "spell",
              location: "deck",
            },
          ],
          hand: [],
          field: [chickenGame],
          graveyard: [],
          banished: [],
        },
        activatedIgnitionEffectsThisTurn: new Set<string>(),
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(true);
    });

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: [],
          hand: [],
          field: [chickenGame],
          graveyard: [],
          banished: [],
        },
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
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Draw",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: [],
          hand: [],
          field: [chickenGame],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when player LP is less than 1000", () => {
      // Arrange: LP = 999
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        lp: {
          player: 999,
          opponent: 8000,
        },
        zones: {
          deck: [],
          hand: [],
          field: [chickenGame],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when effect already activated this turn", () => {
      // Arrange: Effect already activated
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const effectKey = `${cardInstanceId}:chicken-game-ignition`;
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: [],
          hand: [],
          field: [chickenGame],
          graveyard: [],
          banished: [],
        },
        activatedIgnitionEffectsThisTurn: new Set<string>([effectKey]),
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when Chicken Game is not on field", () => {
      // Arrange: No Chicken Game on field
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: [],
          hand: [],
          field: [], // No Chicken Game
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when Chicken Game is face down", () => {
      // Arrange: Chicken Game is face down
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const faceDownChickenGame: CardInstance = {
        ...chickenGame,
        position: "faceDown",
      };
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: [],
          hand: [],
          field: [faceDownChickenGame],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return 2 steps: Pay LP and Record activation", () => {
      // Arrange
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
      });

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toHaveLength(2);
      expect(steps[0].id).toBe("chicken-game-pay-lp");
      expect(steps[1].id).toBe("chicken-game-record-activation");
    });

    it("should pay 1000 LP in first step", () => {
      // Arrange
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
      });
      const steps = action.createActivationSteps(state);

      // Act
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.lp.player).toBe(7000); // 8000 - 1000
      expect(result.newState.lp.opponent).toBe(8000); // Unchanged
    });

    it("should fail if LP is insufficient during activation", () => {
      // Arrange
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 500, opponent: 8000 }, // Not enough LP
      });
      const steps = action.createActivationSteps(state);

      // Act
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot pay 1000 LP");
    });

    it("should record activation in second step", () => {
      // Arrange
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 7000, opponent: 8000 },
        activatedIgnitionEffectsThisTurn: new Set<string>(),
      });
      const steps = action.createActivationSteps(state);
      const effectKey = `${cardInstanceId}:chicken-game-ignition`;

      // Act
      const result = steps[1].action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.activatedIgnitionEffectsThisTurn.has(effectKey)).toBe(true);
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return 1 step: Draw 1 card", () => {
      // Arrange
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
      });

      // Act
      const steps = action.createResolutionSteps(state, cardInstanceId);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("chicken-game-draw");
    });

    it("should draw 1 card from deck", () => {
      // Arrange
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const deckCard: CardInstance = {
        instanceId: "deck-0",
        id: 1001,
        type: "spell",
        frameType: "spell",
        location: "deck",
      };
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [deckCard],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      const steps = action.createResolutionSteps(state, cardInstanceId);

      // Act
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.zones.deck).toHaveLength(0);
      expect(result.newState.zones.hand).toHaveLength(1);
      expect(result.newState.zones.hand[0].id).toBe(1001);
    });

    it("should fail if deck is empty", () => {
      // Arrange
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [], // Empty deck
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      const steps = action.createResolutionSteps(state, cardInstanceId);

      // Act
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot draw 1 card");
    });
  });

  describe("Once per turn restriction", () => {
    it("should allow activation if not activated this turn", () => {
      // Arrange
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: [],
          hand: [],
          field: [chickenGame],
          graveyard: [],
          banished: [],
        },
        activatedIgnitionEffectsThisTurn: new Set<string>(),
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(true);
    });

    it("should prevent second activation in same turn", () => {
      // Arrange
      const action = new ChickenGameIgnitionEffect(cardInstanceId);
      const effectKey = `${cardInstanceId}:chicken-game-ignition`;
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: [],
          hand: [],
          field: [chickenGame],
          graveyard: [],
          banished: [],
        },
        activatedIgnitionEffectsThisTurn: new Set<string>([effectKey]),
      });

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });
  });
});
