/**
 * PotOfGreedAction Tests
 *
 * Tests for PotOfGreedAction ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase, Deck size)
 * - createActivationSteps() returns empty array (no activation cost)
 * - createResolutionSteps() returns 2 steps (Draw 2, Graveyard)
 * - Each step's action correctly updates GameState
 *
 * @module tests/unit/domain/effects/chainable/PotOfGreedAction
 */

import { describe, it, expect } from "vitest";
import { PotOfGreedAction } from "$lib/domain/effects/chainable/PotOfGreedAction";
import { createInitialGameState } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";

describe("PotOfGreedAction", () => {
  const action = new PotOfGreedAction();

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
      // Arrange: Game not over, Main Phase 1, Deck >= 2
      const state = createInitialGameState([1001, 1002, 1003]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const state = createInitialGameState([1001, 1002, 1003]);
      const gameOverState: GameState = {
        ...state,
        phase: "Main1",
        result: {
          isGameOver: true,
          winner: "player",
          reason: "exodia",
        },
      };

      // Act & Assert
      expect(action.canActivate(gameOverState)).toBe(false);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw
      const state = createInitialGameState([1001, 1002, 1003]);
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when phase is Standby", () => {
      // Arrange: Phase is Standby
      const state = createInitialGameState([1001, 1002, 1003]);
      const standbyState: GameState = {
        ...state,
        phase: "Standby",
      };

      // Act & Assert
      expect(action.canActivate(standbyState)).toBe(false);
    });

    it("should return false when deck has only 1 card", () => {
      // Arrange: Deck has 1 card
      const state = createInitialGameState([1001]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
    });

    it("should return false when deck is empty", () => {
      // Arrange: Deck is empty
      const state = createInitialGameState([]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
    });

    it("should return true when deck has exactly 2 cards", () => {
      // Arrange: Deck has exactly 2 cards
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return empty array (no activation steps for normal spell)", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toEqual([]);
      expect(steps).toHaveLength(0);
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return 2 resolution steps", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "pot-of-greed-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps).toHaveLength(2);
    });

    it("should have Draw step as first step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "pot-of-greed-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[0].id).toBe("pot-of-greed-draw");
      expect(steps[0].summary).toBe("カードをドロー");
      expect(steps[0].description).toBe("デッキから2枚ドローします");
    });

    it("should have Graveyard step as second step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "pot-of-greed-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[1].id).toBe("pot-of-greed-graveyard");
      expect(steps[1].summary).toBe("墓地へ送る");
      expect(steps[1].description).toBe("強欲な壺を墓地に送ります");
    });

    describe("Draw step action", () => {
      it("should draw 2 cards from deck to hand", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003, 1004]);
        const activatedCardInstanceId = "pot-of-greed-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.deck).toHaveLength(2); // 4 - 2 = 2
        expect(result.newState.zones.hand).toHaveLength(2); // 0 + 2 = 2
        expect(result.message).toBe("Drew 2 cards");
      });

      it("should return failure when deck has only 1 card", () => {
        // Arrange
        const state = createInitialGameState([1001]);
        const activatedCardInstanceId = "pot-of-greed-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(result.success).toBe(false);
        expect(result.newState).toBe(state); // State unchanged
        expect(result.error).toBe("Cannot draw 2 cards. Not enough cards in deck.");
      });

      it("should return failure when deck is empty", () => {
        // Arrange
        const state = createInitialGameState([]);
        const activatedCardInstanceId = "pot-of-greed-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(result.success).toBe(false);
        expect(result.newState).toBe(state); // State unchanged
        expect(result.error).toBe("Cannot draw 2 cards. Not enough cards in deck.");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const originalDeckLength = state.zones.deck.length;
        const originalHandLength = state.zones.hand.length;
        const activatedCardInstanceId = "pot-of-greed-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(state.zones.deck).toHaveLength(originalDeckLength);
        expect(state.zones.hand).toHaveLength(originalHandLength);
        expect(result.newState).not.toBe(state);
      });
    });

    describe("Graveyard step action", () => {
      it("should send activated card to graveyard", () => {
        // Arrange: Create state with activated card in hand
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "pot-of-greed-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 55144522,
                instanceId: activatedCardInstanceId,
                name: "Pot of Greed",
                type: "Spell",
                location: "hand",
              },
            ],
          },
        };

        const steps = action.createResolutionSteps(stateWithSpellInHand, activatedCardInstanceId);

        // Act
        const result = steps[1].action(stateWithSpellInHand);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.graveyard).toHaveLength(1);
        expect(result.newState.zones.graveyard[0].instanceId).toBe(activatedCardInstanceId);
        expect(result.newState.zones.graveyard[0].location).toBe("graveyard");
        expect(result.message).toBe("Sent Pot of Greed to graveyard");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "pot-of-greed-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 55144522,
                instanceId: activatedCardInstanceId,
                name: "Pot of Greed",
                type: "Spell",
                location: "hand",
              },
            ],
          },
        };

        const originalGraveyardLength = stateWithSpellInHand.zones.graveyard.length;
        const steps = action.createResolutionSteps(stateWithSpellInHand, activatedCardInstanceId);

        // Act
        const result = steps[1].action(stateWithSpellInHand);

        // Assert
        expect(stateWithSpellInHand.zones.graveyard).toHaveLength(originalGraveyardLength);
        expect(result.newState).not.toBe(stateWithSpellInHand);
      });
    });
  });
});
