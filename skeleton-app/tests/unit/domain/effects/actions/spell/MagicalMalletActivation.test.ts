/**
 * MagicalMalletActivation Tests
 *
 * Tests for MagicalMalletActivation ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase)
 * - createActivationSteps() returns activation notification
 * - createResolutionSteps() returns 4 steps (Select, Return+Shuffle, Draw, Graveyard)
 * - Edge cases: 0 cards selected, all cards selected
 * - Card selection, deck shuffle notification, and draw validation
 *
 * @module tests/unit/domain/effects/chainable/MagicalMalletActivation
 */

import { describe, it, expect } from "vitest";
import { MagicalMalletActivation } from "$lib/domain/effects/actions/spell/MagicalMalletActivation";
import { createInitialGameState } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";

describe("MagicalMalletActivation", () => {
  const action = new MagicalMalletActivation();

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
      expect(steps[0].id).toBe("magical-mallet-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《打ち出の小槌》を発動します");
      expect(steps[0].notificationLevel).toBe("info");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return 4 resolution steps", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "magical-mallet-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps).toHaveLength(4);
      expect(steps[0].id).toBe("magical-mallet-select");
      expect(steps[1].id).toBe("magical-mallet-return-shuffle");
      expect(steps[2].id).toBe("magical-mallet-draw");
      expect(steps[3].id).toBe("magical-mallet-graveyard");
    });

    it("should have card selection step as first step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "magical-mallet-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[0].id).toBe("magical-mallet-select");
      expect(steps[0].summary).toBe("手札を選択");
      expect(steps[0].notificationLevel).toBe("interactive");
      expect(steps[0].cardSelectionConfig).toBeDefined();
      expect(steps[0].cardSelectionConfig?.minCards).toBe(0);
      expect(steps[0].cardSelectionConfig?.cancelable).toBe(false);
    });

    it("should have return+shuffle notification step as second step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "magical-mallet-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[1].id).toBe("magical-mallet-return-shuffle");
      expect(steps[1].summary).toBe("デッキに戻してシャッフル");
      expect(steps[1].description).toBe("選択したカードをデッキに戻し、デッキをシャッフルします");
      expect(steps[1].notificationLevel).toBe("info");
    });

    it("should have draw step as third step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "magical-mallet-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[2].id).toBe("magical-mallet-draw");
      expect(steps[2].summary).toBe("カードをドロー");
      expect(steps[2].notificationLevel).toBe("info");
    });

    it("should have graveyard step as fourth step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "magical-mallet-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[3].id).toBe("magical-mallet-graveyard");
      expect(steps[3].summary).toBe("墓地へ送る");
      expect(steps[3].description).toBe("《打ち出の小槌》を墓地に送ります");
    });

    describe("Step 1: Card selection step action", () => {
      it("should store selected cards in metadata when cards are selected", () => {
        // Arrange: Hand has 3 cards, select 2
        const state = createInitialGameState([1001, 1002, 1003, 1004]);
        const stateWithCardsInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              {
                id: 2001,
                instanceId: "hand-0",
                jaName: "Card 1",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
              {
                id: 2002,
                instanceId: "hand-1",
                jaName: "Card 2",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
              {
                id: 2003,
                instanceId: "hand-2",
                jaName: "Card 3",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
            ],
          },
        };
        const activatedCardInstanceId = "magical-mallet-instance-1";
        const steps = action.createResolutionSteps(stateWithCardsInHand, activatedCardInstanceId);

        // Act: Select 2 cards
        const result = steps[0].action(stateWithCardsInHand, ["hand-0", "hand-1"]);

        // Assert
        expect(result.success).toBe(true);
        const metadata = (result.newState as GameState & { metadata?: Record<string, unknown> }).metadata as Record<
          string,
          unknown
        >;
        expect(metadata.magicalMalletReturnCount).toBe(2);
        expect(metadata.magicalMalletInstanceIds).toEqual(["hand-0", "hand-1"]);
      });

      it("should handle 0 cards selected (edge case)", () => {
        // Arrange: Hand has 3 cards, select 0
        const state = createInitialGameState([1001, 1002, 1003, 1004]);
        const stateWithCardsInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              {
                id: 2001,
                instanceId: "hand-0",
                jaName: "Card 1",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
              {
                id: 2002,
                instanceId: "hand-1",
                jaName: "Card 2",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
              {
                id: 2003,
                instanceId: "hand-2",
                jaName: "Card 3",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
            ],
          },
        };
        const activatedCardInstanceId = "magical-mallet-instance-1";
        const steps = action.createResolutionSteps(stateWithCardsInHand, activatedCardInstanceId);

        // Act: Select 0 cards
        const result = steps[0].action(stateWithCardsInHand, []);

        // Assert
        expect(result.success).toBe(true);
        const metadata = (result.newState as GameState & { metadata?: Record<string, unknown> }).metadata as Record<
          string,
          unknown
        >;
        expect(metadata.magicalMalletReturnCount).toBe(0);
        expect(metadata.magicalMalletInstanceIds).toEqual([]);
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const stateWithCardsInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              {
                id: 2001,
                instanceId: "hand-0",
                jaName: "Card 1",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
              {
                id: 2002,
                instanceId: "hand-1",
                jaName: "Card 2",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
            ],
          },
        };
        const originalHandLength = stateWithCardsInHand.zones.hand.length;
        const activatedCardInstanceId = "magical-mallet-instance-1";
        const steps = action.createResolutionSteps(stateWithCardsInHand, activatedCardInstanceId);

        // Act
        const result = steps[0].action(stateWithCardsInHand, ["hand-0"]);

        // Assert
        expect(stateWithCardsInHand.zones.hand).toHaveLength(originalHandLength);
        expect(result.newState).not.toBe(stateWithCardsInHand);
      });
    });

    describe("Step 2: Return and shuffle step action", () => {
      it("should return cards to deck and shuffle when cards were selected", () => {
        // Arrange: Create state with metadata from selection step
        const state = createInitialGameState([1001, 1002]);
        const stateWithMetadata: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              {
                id: 2001,
                instanceId: "hand-0",
                jaName: "Card 1",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
              {
                id: 2002,
                instanceId: "hand-1",
                jaName: "Card 2",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
            ],
            deck: state.zones.deck,
          },
          metadata: {
            magicalMalletReturnCount: 2,
            magicalMalletInstanceIds: ["hand-0", "hand-1"],
          },
        } as GameState;

        const activatedCardInstanceId = "magical-mallet-instance-1";
        const steps = action.createResolutionSteps(stateWithMetadata, activatedCardInstanceId);

        const originalDeckLength = stateWithMetadata.zones.deck.length;

        // Act
        const result = steps[1].action(stateWithMetadata);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.hand).toHaveLength(0); // 2 cards returned
        expect(result.newState.zones.deck).toHaveLength(originalDeckLength + 2); // 2 cards added
        expect(result.message).toContain("Returned 2 cards to deck and shuffled");
      });

      it("should handle 0 cards case (no return, no shuffle)", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const stateWithMetadata: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              {
                id: 2001,
                instanceId: "hand-0",
                jaName: "Card 1",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
            ],
          },
          metadata: {
            magicalMalletReturnCount: 0,
            magicalMalletInstanceIds: [],
          },
        } as GameState;

        const activatedCardInstanceId = "magical-mallet-instance-1";
        const steps = action.createResolutionSteps(stateWithMetadata, activatedCardInstanceId);

        // Act
        const result = steps[1].action(stateWithMetadata);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.hand).toHaveLength(1); // Unchanged
        expect(result.message).toBe("No cards to return");
      });
    });

    describe("Step 3: Draw step action", () => {
      it("should draw same number of cards as were returned", () => {
        // Arrange: Create state after return step
        const state = createInitialGameState([1001, 1002, 1003, 1004]);
        const stateAfterReturn: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              {
                id: 2003,
                instanceId: "hand-2",
                jaName: "Card 3",
                type: "monster",
                frameType: "normal",
                location: "hand",
              },
            ],
            deck: [
              ...state.zones.deck,
              {
                id: 2001,
                instanceId: "hand-0",
                jaName: "Card 1",
                type: "monster",
                frameType: "normal",
                location: "deck",
              },
              {
                id: 2002,
                instanceId: "hand-1",
                jaName: "Card 2",
                type: "monster",
                frameType: "normal",
                location: "deck",
              },
            ],
          },
          metadata: {
            magicalMalletReturnCount: 2,
            magicalMalletInstanceIds: ["hand-0", "hand-1"],
          },
        } as GameState;

        const activatedCardInstanceId = "magical-mallet-instance-1";
        const steps = action.createResolutionSteps(stateAfterReturn, activatedCardInstanceId);

        const originalDeckLength = stateAfterReturn.zones.deck.length;

        // Act
        const result = steps[2].action(stateAfterReturn);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.hand).toHaveLength(3); // 1 + 2 = 3
        expect(result.newState.zones.deck).toHaveLength(originalDeckLength - 2); // Drew 2
        expect(result.message).toBe("Drew 2 cards");
      });

      it("should handle 0 cards case (no draw)", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const stateWithMetadata: GameState = {
          ...state,
          metadata: {
            magicalMalletReturnCount: 0,
            magicalMalletInstanceIds: [],
          },
        } as GameState;

        const activatedCardInstanceId = "magical-mallet-instance-1";
        const steps = action.createResolutionSteps(stateWithMetadata, activatedCardInstanceId);

        // Act
        const result = steps[2].action(stateWithMetadata);

        // Assert
        expect(result.success).toBe(true);
        expect(result.message).toBe("No cards to draw");
      });

      it("should fail when deck has insufficient cards", () => {
        // Arrange: Deck has only 1 card, but need to draw 2
        const state = createInitialGameState([1001]);
        const stateWithMetadata: GameState = {
          ...state,
          metadata: {
            magicalMalletReturnCount: 2,
            magicalMalletInstanceIds: ["hand-0", "hand-1"],
          },
        } as GameState;

        const activatedCardInstanceId = "magical-mallet-instance-1";
        const steps = action.createResolutionSteps(stateWithMetadata, activatedCardInstanceId);

        // Act
        const result = steps[2].action(stateWithMetadata);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toContain("Cannot draw 2 cards");
      });
    });

    describe("Step 4: Graveyard step action", () => {
      it("should send activated card to graveyard", () => {
        // Arrange: Create state with activated card in hand
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "magical-mallet-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 85852291,
                instanceId: activatedCardInstanceId,
                jaName: "打ち出の小槌",
                type: "spell",
                frameType: "spell",
                location: "hand",
              },
            ],
          },
        };

        const steps = action.createResolutionSteps(stateWithSpellInHand, activatedCardInstanceId);

        // Act
        const result = steps[3].action(stateWithSpellInHand);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.graveyard).toHaveLength(1);
        expect(result.newState.zones.graveyard[0].instanceId).toBe(activatedCardInstanceId);
        expect(result.newState.zones.graveyard[0].location).toBe("graveyard");
        expect(result.message).toBe("Sent Magical Mallet to graveyard");
      });

      it("should not mutate original state", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "magical-mallet-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 85852291,
                instanceId: activatedCardInstanceId,
                jaName: "打ち出の小槌",
                type: "spell",
                frameType: "spell",
                location: "hand",
              },
            ],
          },
        };

        const originalGraveyardLength = stateWithSpellInHand.zones.graveyard.length;
        const steps = action.createResolutionSteps(stateWithSpellInHand, activatedCardInstanceId);

        // Act
        const result = steps[3].action(stateWithSpellInHand);

        // Assert
        expect(stateWithSpellInHand.zones.graveyard).toHaveLength(originalGraveyardLength);
        expect(result.newState).not.toBe(stateWithSpellInHand);
      });
    });
  });
});
