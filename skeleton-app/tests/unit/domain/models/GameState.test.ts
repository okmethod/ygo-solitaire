/**
 * Unit tests for GameState creation and immutability
 *
 * Tests:
 * - createInitialGameState factory function
 * - Immutability enforcement via Immer
 * - Readonly properties cannot be mutated
 * - Original state remains unchanged after updates
 */

import { describe, it, expect } from "vitest";
import { createInitialGameState, findCardInstance, hasExodiaInHand } from "$lib/domain/models/GameState";
import { produce } from "immer";
import { EXODIA_PIECE_IDS } from "$lib/domain/models/constants";

describe("GameState", () => {
  describe("createInitialGameState", () => {
    it("should create initial state with given deck", () => {
      const deckCardIds = ["card1", "card2", "card3"];
      const state = createInitialGameState(deckCardIds);

      expect(state.zones.deck.length).toBe(3);
      expect(state.zones.hand.length).toBe(0);
      expect(state.zones.field.length).toBe(0);
      expect(state.zones.graveyard.length).toBe(0);
      expect(state.zones.banished.length).toBe(0);
    });

    it("should initialize with correct default values", () => {
      const state = createInitialGameState(["card1"]);

      expect(state.lp.player).toBe(8000);
      expect(state.lp.opponent).toBe(8000);
      expect(state.phase).toBe("Draw");
      expect(state.turn).toBe(1);
      expect(state.chainStack.length).toBe(0);
      expect(state.result.isGameOver).toBe(false);
    });

    it("should create unique instance IDs for deck cards", () => {
      const state = createInitialGameState(["card1", "card2", "card3"]);

      const instanceIds = state.zones.deck.map((card) => card.instanceId);
      const uniqueIds = new Set(instanceIds);

      expect(uniqueIds.size).toBe(3);
      expect(instanceIds).toEqual(["deck-0", "deck-1", "deck-2"]);
    });

    it("should set correct location for deck cards", () => {
      const state = createInitialGameState(["card1", "card2"]);

      state.zones.deck.forEach((card) => {
        expect(card.location).toBe("deck");
      });
    });

    it("should handle empty deck", () => {
      const state = createInitialGameState([]);

      expect(state.zones.deck.length).toBe(0);
      expect(state.result.isGameOver).toBe(false);
    });
  });

  describe("Immutability with Immer", () => {
    it("should create new state instance when updated", () => {
      const originalState = createInitialGameState(["card1", "card2", "card3"]);

      const newState = produce(originalState, (draft) => {
        draft.turn = 2;
      });

      expect(newState).not.toBe(originalState);
      expect(newState.turn).toBe(2);
      expect(originalState.turn).toBe(1);
    });

    it("should not mutate original state when updating zones", () => {
      const originalState = createInitialGameState(["card1", "card2", "card3"]);
      const originalDeckLength = originalState.zones.deck.length;

      const newState = produce(originalState, (draft) => {
        const card = draft.zones.deck.pop();
        if (card) {
          draft.zones.hand.push(card);
        }
      });

      expect(originalState.zones.deck.length).toBe(originalDeckLength);
      expect(originalState.zones.hand.length).toBe(0);
      expect(newState.zones.deck.length).toBe(originalDeckLength - 1);
      expect(newState.zones.hand.length).toBe(1);
    });

    it("should not mutate original state when updating life points", () => {
      const originalState = createInitialGameState(["card1"]);

      const newState = produce(originalState, (draft) => {
        draft.lp.player = 7000;
      });

      expect(originalState.lp.player).toBe(8000);
      expect(newState.lp.player).toBe(7000);
    });

    it("should not mutate original state when updating phase", () => {
      const originalState = createInitialGameState(["card1"]);

      const newState = produce(originalState, (draft) => {
        draft.phase = "Main1";
      });

      expect(originalState.phase).toBe("Draw");
      expect(newState.phase).toBe("Main1");
    });

    it("should not mutate original state when updating chain stack", () => {
      const originalState = createInitialGameState(["card1"]);

      const newState = produce(originalState, (draft) => {
        draft.chainStack.push({
          cardInstanceId: "test-card",
          effectDescription: "Test effect",
        });
      });

      expect(originalState.chainStack.length).toBe(0);
      expect(newState.chainStack.length).toBe(1);
    });

    it("should not mutate original state when updating game result", () => {
      const originalState = createInitialGameState(["card1"]);

      const newState = produce(originalState, (draft) => {
        draft.result.isGameOver = true;
        draft.result.winner = "player";
        draft.result.reason = "exodia";
      });

      expect(originalState.result.isGameOver).toBe(false);
      expect(originalState.result.winner).toBeUndefined();
      expect(newState.result.isGameOver).toBe(true);
      expect(newState.result.winner).toBe("player");
    });

    it("should support nested updates without mutation", () => {
      const originalState = createInitialGameState(["card1", "card2"]);

      const newState = produce(originalState, (draft) => {
        // Move card from deck to hand
        const card = draft.zones.deck.pop();
        if (card) {
          card.location = "hand";
          draft.zones.hand.push(card);
        }
        // Update life points
        draft.lp.player = 7500;
        // Update phase
        draft.phase = "Standby";
      });

      // Original state unchanged
      expect(originalState.zones.deck.length).toBe(2);
      expect(originalState.zones.hand.length).toBe(0);
      expect(originalState.lp.player).toBe(8000);
      expect(originalState.phase).toBe("Draw");

      // New state updated
      expect(newState.zones.deck.length).toBe(1);
      expect(newState.zones.hand.length).toBe(1);
      expect(newState.lp.player).toBe(7500);
      expect(newState.phase).toBe("Standby");
    });
  });

  describe("Helper functions", () => {
    describe("findCardInstance", () => {
      it("should find card in deck", () => {
        const state = createInitialGameState(["card1", "card2", "card3"]);
        const card = findCardInstance(state, "deck-0");

        expect(card).toBeDefined();
        expect(card?.instanceId).toBe("deck-0");
        expect(card?.cardId).toBe("card1");
        expect(card?.location).toBe("deck");
      });

      it("should find card in hand", () => {
        const state = produce(createInitialGameState(["card1"]), (draft) => {
          const card = draft.zones.deck.pop();
          if (card) {
            card.location = "hand";
            draft.zones.hand.push(card);
          }
        });

        const card = findCardInstance(state, "deck-0");
        expect(card).toBeDefined();
        expect(card?.location).toBe("hand");
      });

      it("should return undefined for non-existent card", () => {
        const state = createInitialGameState(["card1"]);
        const card = findCardInstance(state, "non-existent-id");

        expect(card).toBeUndefined();
      });

      it("should search across all zones", () => {
        const state = produce(createInitialGameState(["card1", "card2", "card3"]), (draft) => {
          // Move cards to different zones
          const card1 = draft.zones.deck.pop();
          if (card1) {
            card1.location = "hand";
            draft.zones.hand.push(card1);
          }

          const card2 = draft.zones.deck.pop();
          if (card2) {
            card2.location = "graveyard";
            draft.zones.graveyard.push(card2);
          }
        });

        expect(findCardInstance(state, "deck-0")).toBeDefined();
        expect(findCardInstance(state, "deck-1")).toBeDefined();
        expect(findCardInstance(state, "deck-2")).toBeDefined();
      });
    });

    describe("hasExodiaInHand", () => {
      it("should return true when all 5 Exodia pieces are in hand", () => {
        const state = produce(createInitialGameState([...EXODIA_PIECE_IDS]), (draft) => {
          // Move all Exodia pieces to hand
          draft.zones.hand = draft.zones.deck.map((card) => ({
            ...card,
            location: "hand" as const,
          }));
          draft.zones.deck = [];
        });

        expect(hasExodiaInHand(state)).toBe(true);
      });

      it("should return false when only 4 Exodia pieces are in hand", () => {
        const state = produce(createInitialGameState(EXODIA_PIECE_IDS.slice(0, 4)), (draft) => {
          draft.zones.hand = draft.zones.deck.map((card) => ({
            ...card,
            location: "hand" as const,
          }));
          draft.zones.deck = [];
        });

        expect(hasExodiaInHand(state)).toBe(false);
      });

      it("should return false when no cards are in hand", () => {
        const state = createInitialGameState([...EXODIA_PIECE_IDS]);

        expect(hasExodiaInHand(state)).toBe(false);
      });

      it("should return false when Exodia pieces are in different zones", () => {
        const state = produce(createInitialGameState([...EXODIA_PIECE_IDS]), (draft) => {
          // Move only 3 pieces to hand, rest stay in deck
          for (let i = 0; i < 3; i++) {
            const card = draft.zones.deck.shift();
            if (card) {
              card.location = "hand";
              draft.zones.hand.push(card);
            }
          }
        });

        expect(hasExodiaInHand(state)).toBe(false);
      });
    });
  });

  describe("Type safety", () => {
    it("should enforce readonly at compile time", () => {
      const state = createInitialGameState(["card1"]);

      // These should cause TypeScript errors if uncommented:
      // state.turn = 2; // Error: Cannot assign to 'turn' because it is a read-only property
      // state.zones.deck = []; // Error: Cannot assign to 'deck' because it is a read-only property
      // state.lp.player = 7000; // Error: Cannot assign to 'player' because it is a read-only property

      // Instead, we must use Immer's produce()
      const newState = produce(state, (draft) => {
        draft.turn = 2;
      });

      expect(newState.turn).toBe(2);
      expect(state.turn).toBe(1);
    });
  });
});
