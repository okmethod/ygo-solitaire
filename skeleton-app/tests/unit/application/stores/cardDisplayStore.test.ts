/**
 * Unit tests for cardDisplayStore
 *
 * Tests CardInstance → CardDisplayData transformation via YGOPRODeck API
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { get } from "svelte/store";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { handCards, fieldCards, graveyardCards, banishedCards } from "$lib/application/stores/cardDisplayStore";
import { createMockGameState, createCardInstances } from "$lib/__testUtils__/gameStateFactory";
import * as ygoprodeckApi from "$lib/infrastructure/api/ygoprodeck";
import type { YGOProDeckCard } from "$lib/infrastructure/types/ygoprodeck";
import type { CardDisplayData } from "$lib/application/types/card";
import potOfGreedFixture from "../../../fixtures/ygoprodeck/pot-of-greed.json";
import gracefulCharityFixture from "../../../fixtures/ygoprodeck/graceful-charity.json";

// Mock YGOPRODeck API
vi.mock("$lib/infrastructure/api/ygoprodeck", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/infrastructure/api/ygoprodeck")>();
  return {
    ...actual,
    getCardsByIds: vi.fn(),
    clearCache: actual.clearCache,
  };
});

describe("cardDisplayStore", () => {
  let unsubscribers: Array<() => void> = [];

  beforeEach(() => {
    // Clear cache before each test
    ygoprodeckApi.clearCache();
    vi.clearAllMocks();

    // Reset mocks to default behavior
    const mockGetCardsByIds = vi.mocked(ygoprodeckApi.getCardsByIds);
    mockGetCardsByIds.mockReset();
    mockGetCardsByIds.mockResolvedValue([]);

    // Reset game state to empty
    gameStateStore.set(createMockGameState());
  });

  afterEach(() => {
    // Cleanup all subscriptions
    unsubscribers.forEach((unsub) => unsub());
    unsubscribers = [];
  });

  describe("handCards", () => {
    it("should return empty array when hand is empty", async () => {
      const emptyState = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(emptyState);

      // Wait for store to update
      await new Promise((resolve) => setTimeout(resolve, 10));

      const cards = get(handCards);
      expect(cards).toEqual([]);
    });

    it("should fetch CardDisplayData when hand has cards", async () => {
      // Mock API response
      const mockGetCardsByIds = vi.mocked(ygoprodeckApi.getCardsByIds);
      mockGetCardsByIds.mockResolvedValueOnce([potOfGreedFixture as YGOProDeckCard]);

      // Create state with Pot of Greed in hand
      const stateWithHand = createMockGameState({
        zones: {
          deck: [],
          hand: createCardInstances(["55144522"], "hand"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Subscribe to store to trigger fetch
      const receivedCards: CardDisplayData[][] = [];
      const unsubscribe = handCards.subscribe((cards) => {
        receivedCards.push([...cards]);
      });
      unsubscribers.push(unsubscribe);

      // Set state after subscribing
      gameStateStore.set(stateWithHand);

      // Wait for async fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify the store eventually receives the card data
      const finalCards = receivedCards[receivedCards.length - 1];
      expect(finalCards.length).toBeGreaterThan(0);
      expect(finalCards[0].id).toBe(55144522);
      expect(finalCards[0].name).toBe("Pot of Greed");
      expect(mockGetCardsByIds).toHaveBeenCalledWith(fetch, [55144522]);
    });

    it("should handle API errors gracefully", async () => {
      // Mock API to reject
      const mockGetCardsByIds = vi.mocked(ygoprodeckApi.getCardsByIds);
      mockGetCardsByIds.mockRejectedValueOnce(new Error("API fetch failed"));

      const stateWithHand = createMockGameState({
        zones: {
          deck: [],
          hand: createCardInstances(["55144522"], "hand"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const receivedCards: CardDisplayData[][] = [];
      const unsubscribe = handCards.subscribe((cards) => {
        receivedCards.push([...cards]);
      });
      unsubscribers.push(unsubscribe);

      gameStateStore.set(stateWithHand);

      // Wait for error handling
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should return empty array on error
      const finalCards = receivedCards[receivedCards.length - 1];
      expect(finalCards).toEqual([]);
    });
  });

  describe("fieldCards", () => {
    it("should return empty array when field is empty", async () => {
      const emptyState = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(emptyState);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const cards = get(fieldCards);
      expect(cards).toEqual([]);
    });

    it("should fetch CardDisplayData when field has cards", async () => {
      const mockGetCardsByIds = vi.mocked(ygoprodeckApi.getCardsByIds);
      mockGetCardsByIds.mockResolvedValueOnce([potOfGreedFixture as YGOProDeckCard]);

      const receivedCards: CardDisplayData[][] = [];
      const unsubscribe = fieldCards.subscribe((cards) => {
        receivedCards.push([...cards]);
      });
      unsubscribers.push(unsubscribe);

      const stateWithField = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: createCardInstances(["55144522"], "field"),
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(stateWithField);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const finalCards = receivedCards[receivedCards.length - 1];
      expect(finalCards.length).toBeGreaterThan(0);
      expect(finalCards[0].name).toBe("Pot of Greed");
    });
  });

  describe("graveyardCards", () => {
    it("should return empty array when graveyard is empty", async () => {
      const emptyState = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(emptyState);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const cards = get(graveyardCards);
      expect(cards).toEqual([]);
    });

    it("should fetch CardDisplayData when graveyard has cards", async () => {
      const mockGetCardsByIds = vi.mocked(ygoprodeckApi.getCardsByIds);
      mockGetCardsByIds.mockResolvedValueOnce([gracefulCharityFixture as YGOProDeckCard]);

      const receivedCards: CardDisplayData[][] = [];
      const unsubscribe = graveyardCards.subscribe((cards) => {
        receivedCards.push([...cards]);
      });
      unsubscribers.push(unsubscribe);

      const stateWithGraveyard = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: createCardInstances(["79571449"], "graveyard"),
          banished: [],
        },
      });
      gameStateStore.set(stateWithGraveyard);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const finalCards = receivedCards[receivedCards.length - 1];
      expect(finalCards.length).toBeGreaterThan(0);
      expect(finalCards[0].name).toBe("Graceful Charity");
    });
  });

  describe("banishedCards", () => {
    it("should return empty array when banished zone is empty", async () => {
      const emptyState = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(emptyState);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const cards = get(banishedCards);
      expect(cards).toEqual([]);
    });

    it("should fetch CardDisplayData when banished zone has cards", async () => {
      const mockGetCardsByIds = vi.mocked(ygoprodeckApi.getCardsByIds);
      mockGetCardsByIds.mockResolvedValueOnce([potOfGreedFixture as YGOProDeckCard]);

      const receivedCards: CardDisplayData[][] = [];
      const unsubscribe = banishedCards.subscribe((cards) => {
        receivedCards.push([...cards]);
      });
      unsubscribers.push(unsubscribe);

      const stateWithBanished = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: createCardInstances(["55144522"], "banished"),
        },
      });
      gameStateStore.set(stateWithBanished);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const finalCards = receivedCards[receivedCards.length - 1];
      expect(finalCards.length).toBeGreaterThan(0);
      expect(finalCards[0].name).toBe("Pot of Greed");
    });
  });

  describe("integration", () => {
    it("should reactively update when gameState changes", async () => {
      const mockGetCardsByIds = vi.mocked(ygoprodeckApi.getCardsByIds);

      const receivedCards: CardDisplayData[][] = [];
      const unsubscribe = handCards.subscribe((cards) => {
        receivedCards.push([...cards]);
      });
      unsubscribers.push(unsubscribe);

      // Initial state: empty hand
      const initialState = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(initialState);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Update state: add card to hand
      mockGetCardsByIds.mockResolvedValueOnce([potOfGreedFixture as YGOProDeckCard]);
      const updatedState = createMockGameState({
        zones: {
          deck: [],
          hand: createCardInstances(["55144522"], "hand"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(updatedState);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify reactive update
      const finalCards = receivedCards[receivedCards.length - 1];
      expect(finalCards.length).toBeGreaterThan(0);
      expect(finalCards[0].name).toBe("Pot of Greed");
    });
  });
});
