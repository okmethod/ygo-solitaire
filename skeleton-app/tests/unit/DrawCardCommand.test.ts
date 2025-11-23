/**
 * Unit tests for DrawCardCommand
 */

import { describe, it, expect } from "vitest";
import { DrawCardCommand } from "$lib/application/commands/DrawCardCommand";
import {
  createExodiaDeckState,
  createExodiaVictoryState,
  createMockGameState,
  createCardInstances,
} from "$lib/__testUtils__/gameStateFactory";
import { EXODIA_PIECE_IDS } from "$lib/domain/models/constants";

describe("DrawCardCommand", () => {
  describe("canExecute", () => {
    it("should return true when deck has sufficient cards", () => {
      const state = createExodiaDeckState();
      const command = new DrawCardCommand(1);

      expect(command.canExecute(state)).toBe(true);
    });

    it("should return true when drawing multiple cards with sufficient deck", () => {
      const state = createExodiaDeckState();
      const command = new DrawCardCommand(5);

      expect(command.canExecute(state)).toBe(true);
    });

    it("should return false when deck has insufficient cards", () => {
      const state = createMockGameState({
        zones: {
          deck: createCardInstances(["12345678"], "deck"), // Only 1 card
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      const command = new DrawCardCommand(2); // Try to draw 2

      expect(command.canExecute(state)).toBe(false);
    });

    it("should return false when deck is empty", () => {
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      const command = new DrawCardCommand(1);

      expect(command.canExecute(state)).toBe(false);
    });

    it("should return false when game is already over", () => {
      const state = createExodiaVictoryState();
      const command = new DrawCardCommand(1);

      expect(command.canExecute(state)).toBe(false);
    });
  });

  describe("execute", () => {
    it("should draw 1 card from deck to hand", () => {
      const state = createExodiaDeckState();
      const initialDeckSize = state.zones.deck.length;
      const command = new DrawCardCommand(1);

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.newState.zones.hand.length).toBe(1);
      expect(result.newState.zones.deck.length).toBe(initialDeckSize - 1);
      expect(result.message).toContain("Drew 1 card");
    });

    it("should draw multiple cards", () => {
      const state = createExodiaDeckState();
      const initialDeckSize = state.zones.deck.length;
      const command = new DrawCardCommand(3);

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.newState.zones.hand.length).toBe(3);
      expect(result.newState.zones.deck.length).toBe(initialDeckSize - 3);
      expect(result.message).toContain("Drew 3 cards");
    });

    it("should not mutate original state (immutability)", () => {
      const state = createExodiaDeckState();
      const originalDeckSize = state.zones.deck.length;
      const originalHandSize = state.zones.hand.length;
      const command = new DrawCardCommand(2);

      command.execute(state);

      // Original state should remain unchanged
      expect(state.zones.deck.length).toBe(originalDeckSize);
      expect(state.zones.hand.length).toBe(originalHandSize);
    });

    it("should detect Exodia victory after drawing all pieces", () => {
      // Create state with 4 Exodia pieces in hand and 1 in deck
      const state = createMockGameState({
        zones: {
          deck: createCardInstances([EXODIA_PIECE_IDS[4]], "deck"), // Last piece on top
          hand: createCardInstances([...EXODIA_PIECE_IDS.slice(0, 4)], "hand"), // First 4 pieces
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new DrawCardCommand(1);
      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.newState.result.isGameOver).toBe(true);
      expect(result.newState.result.winner).toBe("player");
      expect(result.newState.result.reason).toBe("exodia");
    });

    it("should fail when deck has insufficient cards", () => {
      const state = createMockGameState({
        zones: {
          deck: createCardInstances(["12345678"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      const command = new DrawCardCommand(2);

      const result = command.execute(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot draw 2 cards");
      expect(result.newState).toBe(state); // State unchanged on failure
    });

    it("should fail when game is already over", () => {
      const state = createExodiaVictoryState();
      const command = new DrawCardCommand(1);

      const result = command.execute(state);

      expect(result.success).toBe(false);
      expect(result.newState).toBe(state);
    });
  });

  describe("getCount", () => {
    it("should return draw count", () => {
      const command1 = new DrawCardCommand(1);
      const command2 = new DrawCardCommand(5);

      expect(command1.getCount()).toBe(1);
      expect(command2.getCount()).toBe(5);
    });
  });

  describe("description", () => {
    it("should have singular description for 1 card", () => {
      const command = new DrawCardCommand(1);

      expect(command.description).toBe("Draw 1 card");
    });

    it("should have plural description for multiple cards", () => {
      const command = new DrawCardCommand(3);

      expect(command.description).toBe("Draw 3 cards");
    });
  });
});
