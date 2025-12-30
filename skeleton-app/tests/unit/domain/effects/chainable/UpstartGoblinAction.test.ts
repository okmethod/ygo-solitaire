/**
 * UpstartGoblinAction Tests
 *
 * Tests for UpstartGoblinAction ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase, Deck size)
 * - createActivationSteps() returns activation notification
 * - createResolutionSteps() returns 3 steps (Draw 1, LP gain, Graveyard)
 * - Each step's action correctly updates GameState
 * - Opponent LP gain validation
 *
 * @module tests/unit/domain/effects/chainable/UpstartGoblinAction
 */

import { describe, it, expect } from "vitest";
import { UpstartGoblinAction } from "$lib/domain/effects/chainable/UpstartGoblinAction";
import { createInitialGameState, INITIAL_LP } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";

describe("UpstartGoblinAction", () => {
  const action = new UpstartGoblinAction();

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
      // Arrange: Game not over, Main Phase 1, Deck >= 1
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const state = createInitialGameState([1001, 1002]);
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
      const state = createInitialGameState([1001, 1002]);
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when phase is Standby", () => {
      // Arrange: Phase is Standby
      const state = createInitialGameState([1001, 1002]);
      const standbyState: GameState = {
        ...state,
        phase: "Standby",
      };

      // Act & Assert
      expect(action.canActivate(standbyState)).toBe(false);
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

    it("should return true when deck has exactly 1 card", () => {
      // Arrange: Deck has exactly 1 card
      const state = createInitialGameState([1001]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return activation notification step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("upstart-goblin-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("成金ゴブリンを発動します");
      expect(steps[0].notificationLevel).toBe("info");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return 3 resolution steps", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const activatedCardInstanceId = "upstart-goblin-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps).toHaveLength(3);
    });

    it("should have Draw step as first step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const activatedCardInstanceId = "upstart-goblin-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[0].id).toBe("upstart-goblin-draw");
      expect(steps[0].summary).toBe("カードをドロー");
      expect(steps[0].description).toBe("デッキから1枚ドローします");
    });

    it("should have LP gain step as second step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const activatedCardInstanceId = "upstart-goblin-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[1].id).toBe("upstart-goblin-lp-gain");
      expect(steps[1].summary).toBe("相手のLPを増加");
      expect(steps[1].description).toBe("相手のLPが1000増加します");
    });

    it("should have Graveyard step as third step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const activatedCardInstanceId = "upstart-goblin-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[2].id).toBe("upstart-goblin-graveyard");
      expect(steps[2].summary).toBe("墓地へ送る");
      expect(steps[2].description).toBe("成金ゴブリンを墓地に送ります");
    });

    describe("Draw step action", () => {
      it("should draw 1 card from deck to hand", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const activatedCardInstanceId = "upstart-goblin-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.deck).toHaveLength(2); // 3 - 1 = 2
        expect(result.newState.zones.hand).toHaveLength(1); // 0 + 1 = 1
        expect(result.message).toBe("Drew 1 card");
      });

      it("should return failure when deck is empty", () => {
        // Arrange
        const state = createInitialGameState([]);
        const activatedCardInstanceId = "upstart-goblin-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(result.success).toBe(false);
        expect(result.newState).toBe(state); // State unchanged
        expect(result.error).toBe("Cannot draw 1 card. Not enough cards in deck.");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const originalDeckLength = state.zones.deck.length;
        const originalHandLength = state.zones.hand.length;
        const activatedCardInstanceId = "upstart-goblin-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(state.zones.deck).toHaveLength(originalDeckLength);
        expect(state.zones.hand).toHaveLength(originalHandLength);
        expect(result.newState).not.toBe(state);
      });
    });

    describe("LP gain step action", () => {
      it("should increase opponent LP by 1000", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "upstart-goblin-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[1].action(state);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.lp.opponent).toBe(INITIAL_LP + 1000);
        expect(result.newState.lp.player).toBe(INITIAL_LP); // Player LP unchanged
        expect(result.message).toBe("Opponent gained 1000 LP");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const originalOpponentLP = state.lp.opponent;
        const activatedCardInstanceId = "upstart-goblin-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[1].action(state);

        // Assert
        expect(state.lp.opponent).toBe(originalOpponentLP);
        expect(result.newState).not.toBe(state);
      });
    });

    describe("Graveyard step action", () => {
      it("should send activated card to graveyard", () => {
        // Arrange: Create state with activated card in hand
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "upstart-goblin-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 70368879,
                instanceId: activatedCardInstanceId,
                name: "Upstart Goblin",
                type: "Spell",
                location: "hand",
              },
            ],
          },
        };

        const steps = action.createResolutionSteps(stateWithSpellInHand, activatedCardInstanceId);

        // Act
        const result = steps[2].action(stateWithSpellInHand);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.graveyard).toHaveLength(1);
        expect(result.newState.zones.graveyard[0].instanceId).toBe(activatedCardInstanceId);
        expect(result.newState.zones.graveyard[0].location).toBe("graveyard");
        expect(result.message).toBe("Sent Upstart Goblin to graveyard");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "upstart-goblin-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 70368879,
                instanceId: activatedCardInstanceId,
                name: "Upstart Goblin",
                type: "Spell",
                location: "hand",
              },
            ],
          },
        };

        const originalGraveyardLength = stateWithSpellInHand.zones.graveyard.length;
        const steps = action.createResolutionSteps(stateWithSpellInHand, activatedCardInstanceId);

        // Act
        const result = steps[2].action(stateWithSpellInHand);

        // Assert
        expect(stateWithSpellInHand.zones.graveyard).toHaveLength(originalGraveyardLength);
        expect(result.newState).not.toBe(stateWithSpellInHand);
      });
    });
  });
});
