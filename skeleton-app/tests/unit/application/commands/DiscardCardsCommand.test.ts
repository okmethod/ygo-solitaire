/**
 * Unit tests for DiscardCardsCommand
 */

import { describe, it, expect } from "vitest";
import { DiscardCardsCommand } from "$lib/application/commands/DiscardCardsCommand";
import {
  createMockGameState,
  createCardInstances,
  createExodiaVictoryState,
} from "../../../__testUtils__/gameStateFactory";

describe("DiscardCardsCommand", () => {
  describe("canExecute", () => {
    it("should return true when all cards are in hand", () => {
      const cards = createCardInstances(["12345678", "87654321", "11111111"], "hand");
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: cards,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new DiscardCardsCommand([cards[0].instanceId, cards[1].instanceId]);

      expect(command.canExecute(state)).toBe(true);
    });

    it("should return true when discarding single card", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: cards,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new DiscardCardsCommand([cards[0].instanceId]);

      expect(command.canExecute(state)).toBe(true);
    });

    it("should return false when card is not in hand", () => {
      const handCards = createCardInstances(["12345678"], "hand");
      const fieldCards = createCardInstances(["87654321"], "field");
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: handCards,
          field: fieldCards,
          graveyard: [],
          banished: [],
        },
      });

      // Try to discard a card that's on field, not in hand
      const command = new DiscardCardsCommand([fieldCards[0].instanceId]);

      expect(command.canExecute(state)).toBe(false);
    });

    it("should return false when hand is empty", () => {
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new DiscardCardsCommand(["non-existent-id"]);

      expect(command.canExecute(state)).toBe(false);
    });

    it("should return false when game is already over", () => {
      const state = createExodiaVictoryState();
      const command = new DiscardCardsCommand(["any-id"]);

      expect(command.canExecute(state)).toBe(false);
    });

    it("should return false when some cards are not in hand", () => {
      const handCards = createCardInstances(["12345678", "87654321"], "hand");
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: handCards,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Try to discard 1 valid + 1 invalid card
      const command = new DiscardCardsCommand([handCards[0].instanceId, "invalid-id"]);

      expect(command.canExecute(state)).toBe(false);
    });
  });

  describe("execute", () => {
    it("should discard 2 cards from hand to graveyard", () => {
      const cards = createCardInstances(["12345678", "87654321", "11111111"], "hand");
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: cards,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new DiscardCardsCommand([cards[0].instanceId, cards[1].instanceId]);
      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.newState.zones.hand.length).toBe(1); // 3 - 2 = 1
      expect(result.newState.zones.graveyard.length).toBe(2); // 0 + 2 = 2
      expect(result.message).toContain("Discarded 2 cards");
    });

    it("should discard single card", () => {
      const cards = createCardInstances(["12345678", "87654321"], "hand");
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: cards,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new DiscardCardsCommand([cards[0].instanceId]);
      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.newState.zones.hand.length).toBe(1); // 2 - 1 = 1
      expect(result.newState.zones.graveyard.length).toBe(1); // 0 + 1 = 1
      expect(result.message).toContain("Discarded 1 card");
    });

    it("should not mutate original state (immutability)", () => {
      const cards = createCardInstances(["12345678", "87654321"], "hand");
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: cards,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const originalHandSize = state.zones.hand.length;
      const originalGraveyardSize = state.zones.graveyard.length;

      const command = new DiscardCardsCommand([cards[0].instanceId]);
      command.execute(state);

      // Original state should remain unchanged
      expect(state.zones.hand.length).toBe(originalHandSize);
      expect(state.zones.graveyard.length).toBe(originalGraveyardSize);
    });

    it("should correctly update card locations", () => {
      const cards = createCardInstances(["12345678", "87654321"], "hand");
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: cards,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new DiscardCardsCommand([cards[0].instanceId]);
      const result = command.execute(state);

      const discardedCard = result.newState.zones.graveyard.find((c) => c.instanceId === cards[0].instanceId);

      expect(discardedCard).toBeDefined();
      expect(discardedCard!.location).toBe("graveyard");
    });

    it("should fail when card is not in hand", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: cards,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new DiscardCardsCommand(["invalid-id"]);
      const result = command.execute(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot discard");
      expect(result.newState).toBe(state); // State unchanged on failure
    });

    it("should fail when game is already over", () => {
      const state = createExodiaVictoryState();
      const command = new DiscardCardsCommand(["any-id"]);

      const result = command.execute(state);

      expect(result.success).toBe(false);
      expect(result.newState).toBe(state);
    });
  });

  describe("getInstanceIds", () => {
    it("should return array of instance IDs", () => {
      const ids = ["hand-0", "hand-1"];
      const command = new DiscardCardsCommand(ids);

      expect(command.getInstanceIds()).toEqual(ids);
    });

    it("should return copy of array (not reference)", () => {
      const ids = ["hand-0"];
      const command = new DiscardCardsCommand(ids);

      const returnedIds = command.getInstanceIds();
      returnedIds.push("hand-1"); // Modify returned array

      // Original should be unchanged
      expect(command.getInstanceIds()).toEqual(["hand-0"]);
    });
  });

  describe("description", () => {
    it("should have singular description for 1 card", () => {
      const command = new DiscardCardsCommand(["hand-0"]);

      expect(command.description).toBe("Discard 1 card");
    });

    it("should have plural description for multiple cards", () => {
      const command = new DiscardCardsCommand(["hand-0", "hand-1", "hand-2"]);

      expect(command.description).toBe("Discard 3 cards");
    });
  });
});
