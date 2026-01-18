/**
 * Unit tests for GameState creation and immutability
 *
 * Tests:
 * - createInitialGameState factory function
 * - Immutability enforcement via spread syntax
 * - Readonly properties cannot be mutated
 * - Original state remains unchanged after updates
 */

import { describe, it, expect } from "vitest";
import { createInitialGameState, findCardInstance, type InitialDeckCardIds } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";

/** テスト用ヘルパー: カードID配列をInitialDeckCardIdsに変換 */
function createTestInitialDeck(mainDeckCardIds: number[]): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds: [] };
}

describe("GameState", () => {
  describe("createInitialGameState", () => {
    it("should create initial state with given deck (numeric IDs)", () => {
      const deckCardIds = [1001, 1002, 1003];
      const state = createInitialGameState(createTestInitialDeck(deckCardIds), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      expect(state.zones.deck.length).toBe(3);
      expect(state.zones.hand.length).toBe(0);
      expect(state.zones.mainMonsterZone.length).toBe(0);
      expect(state.zones.spellTrapZone.length).toBe(0);
      expect(state.zones.fieldZone.length).toBe(0);
      expect(state.zones.graveyard.length).toBe(0);
      expect(state.zones.banished.length).toBe(0);
    });

    it("should initialize with correct default values", () => {
      const state = createInitialGameState(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      expect(state.lp.player).toBe(8000);
      expect(state.lp.opponent).toBe(8000);
      expect(state.phase).toBe("Draw");
      expect(state.turn).toBe(1);
      expect(state.chainStack.length).toBe(0);
      expect(state.result.isGameOver).toBe(false);
      expect(state.normalSummonLimit).toBe(1);
      expect(state.normalSummonUsed).toBe(0);
    });

    it("should create unique instance IDs for deck cards", () => {
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const instanceIds = state.zones.deck.map((card) => card.instanceId);
      const uniqueIds = new Set(instanceIds);

      expect(uniqueIds.size).toBe(3);
      expect(instanceIds).toEqual(["deck-0", "deck-1", "deck-2"]);
    });

    it("should set correct location for deck cards", () => {
      const state = createInitialGameState(createTestInitialDeck([1001, 1002]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      state.zones.deck.forEach((card) => {
        expect(card.location).toBe("deck");
      });
    });

    it("should handle empty deck", () => {
      const state = createInitialGameState(createTestInitialDeck([]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      expect(state.zones.deck.length).toBe(0);
      expect(state.result.isGameOver).toBe(false);
    });
  });

  describe("Immutability with spread syntax", () => {
    it("should create new state instance when updated", () => {
      const originalState = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const newState: GameState = {
        ...originalState,
        turn: 2,
      };

      expect(newState).not.toBe(originalState);
      expect(newState.turn).toBe(2);
      expect(originalState.turn).toBe(1);
    });

    it("should not mutate original state when updating zones", () => {
      const originalState = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const originalDeckLength = originalState.zones.deck.length;

      const card = originalState.zones.deck[originalState.zones.deck.length - 1];
      const newState: GameState = {
        ...originalState,
        zones: {
          ...originalState.zones,
          deck: originalState.zones.deck.slice(0, -1),
          hand: [...originalState.zones.hand, card],
        },
      };

      expect(originalState.zones.deck.length).toBe(originalDeckLength);
      expect(originalState.zones.hand.length).toBe(0);
      expect(newState.zones.deck.length).toBe(originalDeckLength - 1);
      expect(newState.zones.hand.length).toBe(1);
    });

    it("should not mutate original state when updating life points", () => {
      const originalState = createInitialGameState(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const newState: GameState = {
        ...originalState,
        lp: {
          ...originalState.lp,
          player: 7000,
        },
      };

      expect(originalState.lp.player).toBe(8000);
      expect(newState.lp.player).toBe(7000);
    });

    it("should not mutate original state when updating phase", () => {
      const originalState = createInitialGameState(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const newState: GameState = {
        ...originalState,
        phase: "Main1",
      };

      expect(originalState.phase).toBe("Draw");
      expect(newState.phase).toBe("Main1");
    });

    it("should not mutate original state when updating chain stack", () => {
      const originalState = createInitialGameState(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const newState: GameState = {
        ...originalState,
        chainStack: [
          ...originalState.chainStack,
          {
            cardInstanceId: "test-card",
            effectDescription: "Test effect",
          },
        ],
      };

      expect(originalState.chainStack.length).toBe(0);
      expect(newState.chainStack.length).toBe(1);
    });

    it("should not mutate original state when updating game result", () => {
      const originalState = createInitialGameState(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const newState: GameState = {
        ...originalState,
        result: {
          ...originalState.result,
          isGameOver: true,
          winner: "player",
          reason: "exodia",
        },
      };

      expect(originalState.result.isGameOver).toBe(false);
      expect(originalState.result.winner).toBeUndefined();
      expect(newState.result.isGameOver).toBe(true);
      expect(newState.result.winner).toBe("player");
    });

    it("should support nested updates without mutation", () => {
      const originalState = createInitialGameState(createTestInitialDeck([1001, 1002]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      // Move card from deck to hand
      const card = { ...originalState.zones.deck[originalState.zones.deck.length - 1], location: "hand" as const };
      const newState: GameState = {
        ...originalState,
        zones: {
          ...originalState.zones,
          deck: originalState.zones.deck.slice(0, -1),
          hand: [...originalState.zones.hand, card],
        },
        lp: {
          ...originalState.lp,
          player: 7500,
        },
        phase: "Standby",
      };

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
        const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
          skipShuffle: true,
          skipInitialDraw: true,
        });
        const card = findCardInstance(state, "deck-0");

        expect(card).toBeDefined();
        expect(card?.instanceId).toBe("deck-0");
        expect(card?.id).toBe(1001); // CardInstance extends CardData
        expect(card?.location).toBe("deck");
      });

      it("should find card in hand", () => {
        const initialState = createInitialGameState(createTestInitialDeck([1001]), {
          skipShuffle: true,
          skipInitialDraw: true,
        });
        const movedCard = { ...initialState.zones.deck[0], location: "hand" as const };
        const state: GameState = {
          ...initialState,
          zones: {
            ...initialState.zones,
            deck: [],
            hand: [movedCard],
          },
        };

        const card = findCardInstance(state, "deck-0");
        expect(card).toBeDefined();
        expect(card?.location).toBe("hand");
      });

      it("should return undefined for non-existent card", () => {
        const state = createInitialGameState(createTestInitialDeck([1001]), {
          skipShuffle: true,
          skipInitialDraw: true,
        });
        const card = findCardInstance(state, "non-existent-id");

        expect(card).toBeUndefined();
      });

      it("should search across all zones", () => {
        const initialState = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
          skipShuffle: true,
          skipInitialDraw: true,
        });
        const card1 = { ...initialState.zones.deck[2], location: "hand" as const };
        const card2 = { ...initialState.zones.deck[1], location: "graveyard" as const };
        const state: GameState = {
          ...initialState,
          zones: {
            ...initialState.zones,
            deck: [initialState.zones.deck[0]],
            hand: [card1],
            graveyard: [card2],
          },
        };

        expect(findCardInstance(state, "deck-0")).toBeDefined();
        expect(findCardInstance(state, "deck-1")).toBeDefined();
        expect(findCardInstance(state, "deck-2")).toBeDefined();
      });
    });
  });

  describe("Type safety", () => {
    it("should enforce readonly at compile time", () => {
      const state = createInitialGameState(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      // These should cause TypeScript errors if uncommented:
      // state.turn = 2; // Error: Cannot assign to 'turn' because it is a read-only property
      // state.zones.deck = []; // Error: Cannot assign to 'deck' because it is a read-only property
      // state.lp.player = 7000; // Error: Cannot assign to 'player' because it is a read-only property

      // Instead, we must use spread syntax
      const newState: GameState = {
        ...state,
        turn: 2,
      };

      expect(newState.turn).toBe(2);
      expect(state.turn).toBe(1);
    });
  });
});
