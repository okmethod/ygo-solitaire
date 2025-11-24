/**
 * Unit tests for GameFacade
 */

import { describe, it, expect, beforeEach } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { get } from "svelte/store";
import { EXODIA_PIECE_IDS } from "$lib/domain/models/constants";

describe("GameFacade", () => {
  let facade: GameFacade;

  beforeEach(() => {
    facade = new GameFacade();
  });

  describe("initializeGame", () => {
    it("should initialize game with given deck", () => {
      const deckCardIds = ["12345678", "87654321", "11111111"];

      facade.initializeGame(deckCardIds);

      const state = get(gameStateStore);
      expect(state.zones.deck.length).toBe(3);
      expect(state.zones.hand.length).toBe(0);
      expect(state.phase).toBe("Draw");
      expect(state.turn).toBe(1);
    });

    it("should reset state when called multiple times", () => {
      facade.initializeGame(["11111111"]);
      expect(get(gameStateStore).zones.deck.length).toBe(1);

      facade.initializeGame(["22222222", "33333333"]);
      expect(get(gameStateStore).zones.deck.length).toBe(2);
    });
  });

  describe("drawCard", () => {
    beforeEach(() => {
      facade.initializeGame(["card1", "card2", "card3", "card4", "card5"]);
    });

    it("should draw 1 card by default", () => {
      const result = facade.drawCard();

      expect(result.success).toBe(true);
      expect(result.message).toContain("Drew 1 card");

      const state = get(gameStateStore);
      expect(state.zones.hand.length).toBe(1);
      expect(state.zones.deck.length).toBe(4);
    });

    it("should draw multiple cards", () => {
      const result = facade.drawCard(3);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Drew 3 cards");

      const state = get(gameStateStore);
      expect(state.zones.hand.length).toBe(3);
      expect(state.zones.deck.length).toBe(2);
    });

    it("should fail when deck has insufficient cards", () => {
      const result = facade.drawCard(10);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot draw 10 cards");

      const state = get(gameStateStore);
      expect(state.zones.hand.length).toBe(0); // No cards drawn
      expect(state.zones.deck.length).toBe(5); // Deck unchanged
    });

    it("should update store on successful draw", () => {
      const initialDeckSize = get(gameStateStore).zones.deck.length;

      facade.drawCard(2);

      const state = get(gameStateStore);
      expect(state.zones.deck.length).toBe(initialDeckSize - 2);
    });

    it("should detect Exodia victory after drawing", () => {
      // Initialize with 4 Exodia pieces in deck (will be drawn)
      // and 1 Exodia piece already in hand
      facade.initializeGame([...EXODIA_PIECE_IDS.slice(0, 4)]);

      // Manually set 5th piece in hand (simulating previous draw)
      const state = get(gameStateStore);
      gameStateStore.set({
        ...state,
        zones: {
          ...state.zones,
          hand: [{ instanceId: "hand-0", cardId: EXODIA_PIECE_IDS[4], location: "hand" }],
        },
      });

      // Draw 4 more pieces
      facade.drawCard(4);

      const finalState = get(gameStateStore);
      expect(finalState.result.isGameOver).toBe(true);
      expect(finalState.result.winner).toBe("player");
      expect(finalState.result.reason).toBe("exodia");
    });
  });

  describe("advancePhase", () => {
    beforeEach(() => {
      facade.initializeGame(["card1", "card2", "card3"]);
    });

    it("should advance from Draw to Standby", () => {
      expect(facade.getCurrentPhase()).toBe("Draw");

      const result = facade.advancePhase();

      expect(result.success).toBe(true);
      expect(result.message).toContain("スタンバイフェイズ");
      expect(facade.getCurrentPhase()).toBe("Standby");
    });

    it("should advance through all phases", () => {
      facade.advancePhase(); // Draw → Standby
      expect(facade.getCurrentPhase()).toBe("Standby");

      facade.advancePhase(); // Standby → Main1
      expect(facade.getCurrentPhase()).toBe("Main1");

      facade.advancePhase(); // Main1 → End
      expect(facade.getCurrentPhase()).toBe("End");

      facade.advancePhase(); // End → End (循環)
      expect(facade.getCurrentPhase()).toBe("End");
    });

    it("should fail when deck is empty in Draw phase", () => {
      facade.initializeGame([]); // Empty deck

      const result = facade.advancePhase();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot advance from Draw phase");
    });
  });

  describe("getCurrentPhase", () => {
    it("should return current phase", () => {
      facade.initializeGame(["card1"]);

      expect(facade.getCurrentPhase()).toBe("Draw");

      facade.advancePhase();
      expect(facade.getCurrentPhase()).toBe("Standby");
    });
  });

  describe("getGameState", () => {
    it("should return current state snapshot", () => {
      facade.initializeGame(["card1", "card2"]);

      const state = facade.getGameState();

      expect(state.zones.deck.length).toBe(2);
      expect(state.phase).toBe("Draw");
      expect(state.turn).toBe(1);
    });
  });

  describe("activateSpell", () => {
    it("should successfully activate spell card from hand", () => {
      facade.initializeGame(["card1", "card2", "card3", "card4"]);
      facade.drawCard(1);
      facade.advancePhase(); // Draw → Standby
      facade.advancePhase(); // Standby → Main1

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;
      const initialHandSize = state.zones.hand.length;

      const result = facade.activateSpell(cardInstanceId);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Spell card activated");

      const newState = get(gameStateStore);
      expect(newState.zones.hand.length).toBe(initialHandSize - 1);
      expect(newState.zones.graveyard.length).toBe(1);
    });

    it("should fail when not in Main1 phase", () => {
      facade.initializeGame(["card1"]);
      facade.drawCard(1);
      // Still in Draw phase

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = facade.activateSpell(cardInstanceId);

      expect(result.success).toBe(false);
      expect(result.error).toContain("メインフェイズでのみ発動できます");
    });

    it("should fail when card is not in hand", () => {
      facade.initializeGame(["card1", "card2", "card3"]);
      facade.advancePhase(); // Draw → Standby
      facade.advancePhase(); // Standby → Main1

      const result = facade.activateSpell("non-existent-card-id");

      expect(result.success).toBe(false);
      expect(result.error).toContain("見つかりません");
    });

    it("should not update store on failed activation", () => {
      facade.initializeGame(["card1"]);
      const initialState = get(gameStateStore);

      facade.activateSpell("non-existent-card-id");

      const newState = get(gameStateStore);
      expect(newState).toEqual(initialState);
    });
  });

  describe("canActivateCard", () => {
    it("should return true for card in hand during Main1 phase", () => {
      facade.initializeGame(["card1", "card2", "card3"]); // Need multiple cards
      facade.drawCard(1);
      facade.advancePhase(); // Draw → Standby
      facade.advancePhase(); // Standby → Main1

      // Verify we're in Main1 phase
      expect(facade.getCurrentPhase()).toBe("Main1");

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;

      expect(facade.canActivateCard(cardInstanceId)).toBe(true);
    });

    it("should return false for card not in hand", () => {
      facade.initializeGame(["card1"]);

      expect(facade.canActivateCard("non-existent-id")).toBe(false);
    });

    it("should return false for card in wrong phase", () => {
      facade.initializeGame(["card1"]);
      facade.drawCard(1);
      // Still in Draw phase

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;

      expect(facade.canActivateCard(cardInstanceId)).toBe(false);
    });
  });

  describe("checkVictory", () => {
    it("should return game not over initially", () => {
      facade.initializeGame(["card1", "card2"]);

      const result = facade.checkVictory();

      expect(result.isGameOver).toBe(false);
      expect(result.winner).toBeUndefined();
    });

    it("should detect Exodia victory", () => {
      facade.initializeGame([...EXODIA_PIECE_IDS]);
      facade.drawCard(5); // Draw all Exodia pieces

      const result = facade.checkVictory();

      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe("player");
      expect(result.reason).toBe("exodia");
    });
  });

  describe("getCurrentTurn", () => {
    it("should return current turn number", () => {
      facade.initializeGame(["card1"]);

      expect(facade.getCurrentTurn()).toBe(1);
    });
  });

  describe("getPlayerLP and getOpponentLP", () => {
    it("should return initial life points", () => {
      facade.initializeGame(["card1"]);

      expect(facade.getPlayerLP()).toBe(8000);
      expect(facade.getOpponentLP()).toBe(8000);
    });
  });
});
