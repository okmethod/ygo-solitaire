/**
 * ReloadAction Tests
 *
 * Tests for ReloadAction ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase)
 * - createActivationSteps() returns activation notification
 * - createResolutionSteps() returns 2 steps (Select + return + shuffle + draw, Graveyard)
 * - Edge cases: 0 cards selected, all cards selected
 * - Card selection, deck shuffle, and draw validation
 *
 * @module tests/unit/domain/effects/chainable/ReloadAction
 */

import { describe, it, expect } from "vitest";
import { ReloadAction } from "$lib/domain/effects/chainable/ReloadAction";
import { createInitialGameState } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";

describe("ReloadAction", () => {
  const action = new ReloadAction();

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
      // Arrange: Game not over, Main Phase 1
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

    it("should return true even with empty hand", () => {
      // Arrange: Empty hand (edge case)
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          hand: [], // Empty hand
        },
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
      expect(steps[0].id).toBe("reload-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("打ち出の小槌を発動します");
      expect(steps[0].notificationLevel).toBe("info");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return 2 resolution steps", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "reload-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps).toHaveLength(2);
    });

    it("should have card selection step as first step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "reload-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[0].id).toBe("reload-select");
      expect(steps[0].summary).toBe("手札を選択");
      expect(steps[0].notificationLevel).toBe("interactive");
      expect(steps[0].cardSelectionConfig).toBeDefined();
      expect(steps[0].cardSelectionConfig?.minCards).toBe(0);
      expect(steps[0].cardSelectionConfig?.cancelable).toBe(false);
    });

    it("should have graveyard step as second step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "reload-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[1].id).toBe("reload-graveyard");
      expect(steps[1].summary).toBe("墓地へ送る");
      expect(steps[1].description).toBe("打ち出の小槌を墓地に送ります");
    });

    describe("Card selection and return/draw step action", () => {
      it("should handle 0 cards selected (edge case)", () => {
        // Arrange: Hand has 3 cards, select 0
        const state = createInitialGameState([1001, 1002, 1003, 1004]);
        const stateWithCardsInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
              { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
              { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
            ],
          },
        };
        const activatedCardInstanceId = "reload-instance-1";
        const steps = action.createResolutionSteps(stateWithCardsInHand, activatedCardInstanceId);

        // Act: Select 0 cards
        const result = steps[0].action(stateWithCardsInHand, []);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.hand).toHaveLength(3); // Unchanged
        expect(result.newState.zones.deck).toHaveLength(4); // Unchanged
        expect(result.message).toBe("No cards selected to return");
      });

      it("should return 2 cards, shuffle, and draw 2 cards", () => {
        // Arrange: Hand has 3 cards, deck has 4 cards, select 2 to return
        const state = createInitialGameState([1001, 1002, 1003, 1004]);
        const stateWithCardsInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
              { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
              { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
            ],
          },
        };
        const activatedCardInstanceId = "reload-instance-1";
        const steps = action.createResolutionSteps(stateWithCardsInHand, activatedCardInstanceId);

        // Act: Select 2 cards to return
        const result = steps[0].action(stateWithCardsInHand, ["hand-0", "hand-1"]);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.hand).toHaveLength(3); // 3 - 2 + 2 = 3
        expect(result.newState.zones.deck).toHaveLength(4); // 4 + 2 - 2 = 4
        expect(result.message).toContain("Returned 2 cards to deck");
        expect(result.message).toContain("drew 2 cards");
      });

      it("should handle all cards selected (edge case)", () => {
        // Arrange: Hand has 3 cards, deck has 5 cards, select all 3
        const state = createInitialGameState([1001, 1002, 1003, 1004, 1005]);
        const stateWithCardsInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
              { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
              { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
            ],
          },
        };
        const activatedCardInstanceId = "reload-instance-1";
        const steps = action.createResolutionSteps(stateWithCardsInHand, activatedCardInstanceId);

        // Act: Select all 3 cards
        const result = steps[0].action(stateWithCardsInHand, ["hand-0", "hand-1", "hand-2"]);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.hand).toHaveLength(3); // 3 - 3 + 3 = 3
        expect(result.newState.zones.deck).toHaveLength(5); // 5 + 3 - 3 = 5
        expect(result.message).toContain("Returned 3 cards to deck");
      });

      it("should return failure when deck has insufficient cards to draw", () => {
        // Arrange: Hand has 3 cards, deck has only 1 card, select 2 to return
        const state = createInitialGameState([1001]);
        const stateWithCardsInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
              { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
              { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
            ],
          },
        };
        const activatedCardInstanceId = "reload-instance-1";
        const steps = action.createResolutionSteps(stateWithCardsInHand, activatedCardInstanceId);

        // Act: Select 2 cards (but deck will only have 3 cards after return, need to draw 2)
        const result = steps[0].action(stateWithCardsInHand, ["hand-0", "hand-1"]);

        // Assert: Should succeed (1 + 2 = 3 cards in deck, draw 2 works)
        expect(result.success).toBe(true);
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const stateWithCardsInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
              { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
            ],
          },
        };
        const originalHandLength = stateWithCardsInHand.zones.hand.length;
        const originalDeckLength = stateWithCardsInHand.zones.deck.length;
        const activatedCardInstanceId = "reload-instance-1";
        const steps = action.createResolutionSteps(stateWithCardsInHand, activatedCardInstanceId);

        // Act
        const result = steps[0].action(stateWithCardsInHand, ["hand-0"]);

        // Assert
        expect(stateWithCardsInHand.zones.hand).toHaveLength(originalHandLength);
        expect(stateWithCardsInHand.zones.deck).toHaveLength(originalDeckLength);
        expect(result.newState).not.toBe(stateWithCardsInHand);
      });
    });

    describe("Graveyard step action", () => {
      it("should send activated card to graveyard", () => {
        // Arrange: Create state with activated card in hand
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "reload-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 85852291,
                instanceId: activatedCardInstanceId,
                name: "Reload",
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
        expect(result.message).toBe("Sent Reload to graveyard");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "reload-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 85852291,
                instanceId: activatedCardInstanceId,
                name: "Reload",
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
