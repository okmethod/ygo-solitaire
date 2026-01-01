/**
 * GracefulCharityActivation Tests
 *
 * Tests for GracefulCharityActivation ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase, Deck size >= 3)
 * - createActivationSteps() returns empty array (no activation cost)
 * - createResolutionSteps() returns 3 steps (Draw 3, Discard 2, Graveyard)
 * - Each step's action correctly updates GameState
 *
 * @module tests/unit/domain/effects/chainable/GracefulCharityActivation
 */

import { describe, it, expect } from "vitest";
import { GracefulCharityActivation } from "$lib/domain/effects/actions/spell/GracefulCharityActivation";
import { createInitialGameState } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";

describe("GracefulCharityActivation", () => {
  const action = new GracefulCharityActivation();

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
      // Arrange: Game not over, Main Phase 1, Deck >= 3
      const state = createInitialGameState([1001, 1002, 1003, 1004]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const state = createInitialGameState([1001, 1002, 1003, 1004]);
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
      const state = createInitialGameState([1001, 1002, 1003, 1004]);
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when phase is Standby", () => {
      // Arrange: Phase is Standby
      const state = createInitialGameState([1001, 1002, 1003, 1004]);
      const standbyState: GameState = {
        ...state,
        phase: "Standby",
      };

      // Act & Assert
      expect(action.canActivate(standbyState)).toBe(false);
    });

    it("should return false when deck has only 2 cards", () => {
      // Arrange: Deck has 2 cards
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
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

    it("should return true when deck has exactly 3 cards", () => {
      // Arrange: Deck has exactly 3 cards
      const state = createInitialGameState([1001, 1002, 1003]);
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
      const state = createInitialGameState([1001, 1002, 1003, 1004]);

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("79571449-activation"); // ID now uses card ID
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《天使の施し》を発動します"); // Uses getCardNameWithBrackets
      expect(steps[0].notificationLevel).toBe("info");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return 3 resolution steps", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003, 1004]);
      const activatedCardInstanceId = "graceful-charity-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps).toHaveLength(3);
    });

    it("should have Draw step as first step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003, 1004]);
      const activatedCardInstanceId = "graceful-charity-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[0].id).toBe("draw-3"); // ID from createDrawStep
      expect(steps[0].summary).toBe("カードをドロー");
      expect(steps[0].description).toBe("デッキから3枚ドローします");
    });

    it("should have Discard step as second step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003, 1004]);
      const activatedCardInstanceId = "graceful-charity-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[1].id).toBe("graceful-charity-discard");
      expect(steps[1].summary).toBe("手札を捨てる");
      expect(steps[1].description).toBe("手札から2枚選んで捨ててください");
    });

    it("should have Graveyard step as third step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003, 1004]);
      const activatedCardInstanceId = "graceful-charity-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[2].id).toBe("graceful-charity-instance-1-graveyard"); // ID from createSendToGraveyardStep (uses instance ID)
      expect(steps[2].summary).toBe("墓地へ送る");
      expect(steps[2].description).toBe("天使の施しを墓地に送ります");
    });

    describe("Draw step action", () => {
      it("should draw 3 cards from deck to hand", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003, 1004, 1005]);
        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.deck).toHaveLength(2); // 5 - 3 = 2
        expect(result.newState.zones.hand).toHaveLength(3); // 0 + 3 = 3
        expect(result.message).toBe("Drew 3 cards");
      });

      it("should return failure when deck has only 2 cards", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(result.success).toBe(false);
        expect(result.newState).toBe(state); // State unchanged
        expect(result.error).toBe("Cannot draw 3 cards. Not enough cards in deck.");
      });

      it("should return failure when deck is empty", () => {
        // Arrange
        const state = createInitialGameState([]);
        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(result.success).toBe(false);
        expect(result.newState).toBe(state); // State unchanged
        expect(result.error).toBe("Cannot draw 3 cards. Not enough cards in deck.");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003, 1004]);
        const originalDeckLength = state.zones.deck.length;
        const originalHandLength = state.zones.hand.length;
        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[0].action(state);

        // Assert
        expect(state.zones.deck).toHaveLength(originalDeckLength);
        expect(state.zones.hand).toHaveLength(originalHandLength);
        expect(result.newState).not.toBe(state);
      });
    });

    describe("Discard step action", () => {
      it("should have cardSelectionConfig with correct parameters", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const discardStep = steps[1];

        // Assert
        expect(discardStep.cardSelectionConfig).toBeDefined();
        expect(discardStep.cardSelectionConfig?.minCards).toBe(2);
        expect(discardStep.cardSelectionConfig?.maxCards).toBe(2);
        expect(discardStep.cardSelectionConfig?.summary).toBe("手札を捨てる");
        expect(discardStep.cardSelectionConfig?.description).toBe("手札から2枚選んで捨ててください");
      });

      it("should discard 2 selected cards from hand to graveyard", () => {
        // Arrange: Create state with 3 cards in hand
        const state = createInitialGameState([1001, 1002, 1003, 1004, 1005]);
        const stateAfterDraw: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { ...state.zones.deck[0], location: "hand" },
              { ...state.zones.deck[1], location: "hand" },
              { ...state.zones.deck[2], location: "hand" },
            ],
            deck: state.zones.deck.slice(3),
          },
        };

        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(stateAfterDraw, activatedCardInstanceId);

        // Select 2 cards to discard
        const selectedInstanceIds = ["deck-0", "deck-1"];

        // Act
        const result = steps[1].action(stateAfterDraw, selectedInstanceIds);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.hand).toHaveLength(1); // 3 - 2 = 1
        expect(result.newState.zones.graveyard).toHaveLength(2); // 0 + 2 = 2
      });

      it("should return failure when selectedInstanceIds is not provided", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const stateAfterDraw: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { ...state.zones.deck[0], location: "hand" },
              { ...state.zones.deck[1], location: "hand" },
              { ...state.zones.deck[2], location: "hand" },
            ],
            deck: [],
          },
        };

        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(stateAfterDraw, activatedCardInstanceId);

        // Act: Call action without selectedInstanceIds
        const result = steps[1].action(stateAfterDraw);

        // Assert
        expect(result.success).toBe(false);
        expect(result.newState).toBe(stateAfterDraw); // State unchanged
        expect(result.error).toBe("Must select exactly 2 cards to discard");
      });

      it("should return failure when only 1 card is selected", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const stateAfterDraw: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { ...state.zones.deck[0], location: "hand" },
              { ...state.zones.deck[1], location: "hand" },
              { ...state.zones.deck[2], location: "hand" },
            ],
            deck: [],
          },
        };

        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(stateAfterDraw, activatedCardInstanceId);

        // Select only 1 card
        const selectedInstanceIds = ["deck-0"];

        // Act
        const result = steps[1].action(stateAfterDraw, selectedInstanceIds);

        // Assert
        expect(result.success).toBe(false);
        expect(result.newState).toBe(stateAfterDraw); // State unchanged
        expect(result.error).toBe("Must select exactly 2 cards to discard");
      });

      it("should return failure when 3 cards are selected", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const stateAfterDraw: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { ...state.zones.deck[0], location: "hand" },
              { ...state.zones.deck[1], location: "hand" },
              { ...state.zones.deck[2], location: "hand" },
            ],
            deck: [],
          },
        };

        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(stateAfterDraw, activatedCardInstanceId);

        // Select 3 cards
        const selectedInstanceIds = ["deck-0", "deck-1", "deck-2"];

        // Act
        const result = steps[1].action(stateAfterDraw, selectedInstanceIds);

        // Assert
        expect(result.success).toBe(false);
        expect(result.newState).toBe(stateAfterDraw); // State unchanged
        expect(result.error).toBe("Must select exactly 2 cards to discard");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const stateAfterDraw: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { ...state.zones.deck[0], location: "hand" },
              { ...state.zones.deck[1], location: "hand" },
              { ...state.zones.deck[2], location: "hand" },
            ],
            deck: [],
          },
        };

        const originalHandLength = stateAfterDraw.zones.hand.length;
        const originalGraveyardLength = stateAfterDraw.zones.graveyard.length;
        const activatedCardInstanceId = "graceful-charity-instance-1";
        const steps = action.createResolutionSteps(stateAfterDraw, activatedCardInstanceId);

        const selectedInstanceIds = ["deck-0", "deck-1"];

        // Act
        const result = steps[1].action(stateAfterDraw, selectedInstanceIds);

        // Assert
        expect(stateAfterDraw.zones.hand).toHaveLength(originalHandLength);
        expect(stateAfterDraw.zones.graveyard).toHaveLength(originalGraveyardLength);
        expect(result.newState).not.toBe(stateAfterDraw);
      });
    });

    describe("Graveyard step action", () => {
      it("should send activated card to graveyard", () => {
        // Arrange: Create state with activated card in hand
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "graceful-charity-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 79571449,
                instanceId: activatedCardInstanceId,
                name: "Graceful Charity",
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
        expect(result.message).toBe("Sent 天使の施し to graveyard");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "graceful-charity-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 79571449,
                instanceId: activatedCardInstanceId,
                name: "Graceful Charity",
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
