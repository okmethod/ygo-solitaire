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
import type { GameSnapshot, InitialDeckCardIds } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";

/** テスト用ヘルパー: カードID配列をInitialDeckCardIdsに変換 */
function createTestInitialDeck(mainDeckCardIds: number[]): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds: [] };
}

describe("GameState", () => {
  describe("createInitialGameState", () => {
    it("should create initial state with given deck (numeric IDs)", () => {
      const deckCardIds = [1001, 1002, 1003];
      const state = GameState.initialize(createTestInitialDeck(deckCardIds), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      expect(state.space.mainDeck.length).toBe(3);
      expect(state.space.hand.length).toBe(0);
      expect(state.space.mainMonsterZone.length).toBe(0);
      expect(state.space.spellTrapZone.length).toBe(0);
      expect(state.space.fieldZone.length).toBe(0);
      expect(state.space.graveyard.length).toBe(0);
      expect(state.space.banished.length).toBe(0);
    });

    it("should initialize with correct default values", () => {
      const state = GameState.initialize(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      expect(state.lp.player).toBe(8000);
      expect(state.lp.opponent).toBe(8000);
      expect(state.phase).toBe("draw");
      expect(state.turn).toBe(1);
      expect(state.result.isGameOver).toBe(false);
      expect(state.normalSummonLimit).toBe(1);
      expect(state.normalSummonUsed).toBe(0);
    });

    it("should create unique instance IDs for deck cards", () => {
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const instanceIds = state.space.mainDeck.map((card) => card.instanceId);
      const uniqueIds = new Set(instanceIds);

      expect(uniqueIds.size).toBe(3);
      expect(instanceIds).toEqual(["main-0", "main-1", "main-2"]);
    });

    it("should set correct location for deck cards", () => {
      const state = GameState.initialize(createTestInitialDeck([1001, 1002]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      state.space.mainDeck.forEach((card) => {
        expect(card.location).toBe("mainDeck");
      });
    });

    it("should handle empty deck", () => {
      const state = GameState.initialize(createTestInitialDeck([]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      expect(state.space.mainDeck.length).toBe(0);
      expect(state.result.isGameOver).toBe(false);
    });
  });

  describe("Immutability with spread syntax", () => {
    it("should create new state instance when updated", () => {
      const originalState = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const newState: GameSnapshot = {
        ...originalState,
        turn: 2,
      };

      expect(newState).not.toBe(originalState);
      expect(newState.turn).toBe(2);
      expect(originalState.turn).toBe(1);
    });

    it("should not mutate original state when updating zones", () => {
      const originalState = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const originalDeckLength = originalState.space.mainDeck.length;

      const card = originalState.space.mainDeck[originalState.space.mainDeck.length - 1];
      const newState: GameSnapshot = {
        ...originalState,
        space: {
          ...originalState.space,
          mainDeck: originalState.space.mainDeck.slice(0, -1),
          hand: [...originalState.space.hand, card],
        },
      };

      expect(originalState.space.mainDeck.length).toBe(originalDeckLength);
      expect(originalState.space.hand.length).toBe(0);
      expect(newState.space.mainDeck.length).toBe(originalDeckLength - 1);
      expect(newState.space.hand.length).toBe(1);
    });

    it("should not mutate original state when updating life points", () => {
      const originalState = GameState.initialize(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const newState: GameSnapshot = {
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
      const originalState = GameState.initialize(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const newState: GameSnapshot = {
        ...originalState,
        phase: "main1",
      };

      expect(originalState.phase).toBe("draw");
      expect(newState.phase).toBe("main1");
    });

    it("should not mutate original state when updating game result", () => {
      const originalState = GameState.initialize(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      const newState: GameSnapshot = {
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
      const originalState = GameState.initialize(createTestInitialDeck([1001, 1002]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      // Move card from deck to hand
      const card = {
        ...originalState.space.mainDeck[originalState.space.mainDeck.length - 1],
        location: "hand" as const,
      };
      const newState: GameSnapshot = {
        ...originalState,
        space: {
          ...originalState.space,
          mainDeck: originalState.space.mainDeck.slice(0, -1),
          hand: [...originalState.space.hand, card],
        },
        lp: {
          ...originalState.lp,
          player: 7500,
        },
        phase: "standby",
      };

      // Original state unchanged
      expect(originalState.space.mainDeck.length).toBe(2);
      expect(originalState.space.hand.length).toBe(0);
      expect(originalState.lp.player).toBe(8000);
      expect(originalState.phase).toBe("draw");

      // New state updated
      expect(newState.space.mainDeck.length).toBe(1);
      expect(newState.space.hand.length).toBe(1);
      expect(newState.lp.player).toBe(7500);
      expect(newState.phase).toBe("standby");
    });
  });

  describe("Helper functions", () => {
    describe("findCardInstance", () => {
      it("should find card in deck", () => {
        const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
          skipShuffle: true,
          skipInitialDraw: true,
        });
        const card = GameState.Space.findCard(state.space, "main-0");

        expect(card).toBeDefined();
        expect(card?.instanceId).toBe("main-0");
        expect(card?.id).toBe(1001); // CardInstance extends CardData
        expect(card?.location).toBe("mainDeck");
      });

      it("should find card in hand", () => {
        const initialState = GameState.initialize(createTestInitialDeck([1001]), {
          skipShuffle: true,
          skipInitialDraw: true,
        });
        const movedCard = { ...initialState.space.mainDeck[0], location: "hand" as const };
        const state: GameSnapshot = {
          ...initialState,
          space: {
            ...initialState.space,
            mainDeck: [],
            hand: [movedCard],
          },
        };

        const card = GameState.Space.findCard(state.space, "main-0");
        expect(card).toBeDefined();
        expect(card?.location).toBe("hand");
      });

      it("should return undefined for non-existent card", () => {
        const state = GameState.initialize(createTestInitialDeck([1001]), {
          skipShuffle: true,
          skipInitialDraw: true,
        });
        const card = GameState.Space.findCard(state.space, "non-existent-id");
        expect(card).toBeUndefined();
      });

      it("should search across all zones", () => {
        const initialState = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
          skipShuffle: true,
          skipInitialDraw: true,
        });
        const card1 = { ...initialState.space.mainDeck[2], location: "hand" as const };
        const card2 = { ...initialState.space.mainDeck[1], location: "graveyard" as const };
        const state: GameSnapshot = {
          ...initialState,
          space: {
            ...initialState.space,
            mainDeck: [initialState.space.mainDeck[0]],
            hand: [card1],
            graveyard: [card2],
          },
        };

        expect(GameState.Space.findCard(state.space, "main-0")).toBeDefined();
        expect(GameState.Space.findCard(state.space, "main-1")).toBeDefined();
        expect(GameState.Space.findCard(state.space, "main-2")).toBeDefined();
      });
    });
  });

  describe("Type safety", () => {
    it("should enforce readonly at compile time", () => {
      const state = GameState.initialize(createTestInitialDeck([1001]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      // These should cause TypeScript errors if uncommented:
      // state.turn = 2; // Error: Cannot assign to 'turn' because it is a read-only property
      // state.space.mainDeck = []; // Error: Cannot assign to 'deck' because it is a read-only property
      // state.lp.player = 7000; // Error: Cannot assign to 'player' because it is a read-only property

      // Instead, we must use spread syntax
      const newState: GameSnapshot = {
        ...state,
        turn: 2,
      };

      expect(newState.turn).toBe(2);
      expect(state.turn).toBe(1);
    });
  });
});
