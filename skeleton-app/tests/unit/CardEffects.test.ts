/**
 * Card Effects Tests
 *
 * Tests for individual card effect processing.
 * Each card's specific logic is tested here, separated from the universal
 * ActivateSpellCommand flow tests.
 *
 * Test Responsibility:
 * - effectResolutionStore calls for specific cards
 * - EffectResolutionStep content validation
 * - Card-specific validation (deck size, hand requirements)
 *
 * @module tests/unit/CardEffects
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ActivateSpellCommand } from "$lib/application/commands/ActivateSpellCommand";
import { createMockGameState, createCardInstances } from "$lib/__testUtils__/gameStateFactory";
import { effectResolutionStore } from "$lib/stores/effectResolutionStore";
import { get } from "svelte/store";

describe("Card Effects", () => {
  describe("Pot of Greed (55144522)", () => {
    const potOfGreedCardId = "55144522";

    beforeEach(() => {
      // Reset effectResolutionStore before each test
      effectResolutionStore.reset();
    });

    it("should call effectResolutionStore.startResolution when activated", () => {
      // Arrange: Create state with Pot of Greed in hand and sufficient deck
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: [{ instanceId: "pot-1", cardId: potOfGreedCardId, location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Spy on effectResolutionStore.startResolution
      const startResolutionSpy = vi.spyOn(effectResolutionStore, "startResolution");

      // Act: Execute ActivateSpellCommand
      const command = new ActivateSpellCommand("pot-1");
      command.execute(state);

      // Assert: effectResolutionStore.startResolution should be called
      expect(startResolutionSpy).toHaveBeenCalledOnce();

      // Restore spy
      startResolutionSpy.mockRestore();
    });

    it("should create correct EffectResolutionStep structure", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: [{ instanceId: "pot-1", cardId: potOfGreedCardId, location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Spy on effectResolutionStore.startResolution
      const startResolutionSpy = vi.spyOn(effectResolutionStore, "startResolution");

      // Act
      const command = new ActivateSpellCommand("pot-1");
      command.execute(state);

      // Assert: Check the argument passed to startResolution
      expect(startResolutionSpy).toHaveBeenCalledOnce();
      const [[steps]] = startResolutionSpy.mock.calls;

      expect(steps).toHaveLength(1);
      expect(steps[0]).toMatchObject({
        id: "pot-of-greed-draw",
        title: "カードをドローします",
        message: "デッキから2枚ドローします",
      });
      expect(steps[0].action).toBeTypeOf("function");

      // Restore spy
      startResolutionSpy.mockRestore();
    });

    it("canExecute should return false when deck has only 1 card", () => {
      // Arrange: Deck with only 1 card (insufficient for Pot of Greed)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1"], "deck"), // Only 1 card
          hand: [{ instanceId: "pot-1", cardId: potOfGreedCardId, location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("pot-1");
      const result = command.canExecute(state);

      // Assert: canExecute should return false
      expect(result).toBe(false);
    });

    it("canExecute should return true when deck has 2 or more cards", () => {
      // Arrange: Deck with 2 cards (sufficient for Pot of Greed)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: [{ instanceId: "pot-1", cardId: potOfGreedCardId, location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("pot-1");
      const result = command.canExecute(state);

      // Assert: canExecute should return true
      expect(result).toBe(true);
    });

    it("should not call effectResolutionStore for non-Pot-of-Greed cards", () => {
      // Arrange: Different spell card (not Pot of Greed)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: [{ instanceId: "other-spell", cardId: "12345678", location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Spy on effectResolutionStore.startResolution
      const startResolutionSpy = vi.spyOn(effectResolutionStore, "startResolution");

      // Act
      const command = new ActivateSpellCommand("other-spell");
      command.execute(state);

      // Assert: effectResolutionStore.startResolution should NOT be called
      expect(startResolutionSpy).not.toHaveBeenCalled();

      // Restore spy
      startResolutionSpy.mockRestore();
    });
  });

  // Future: Add tests for Graceful Charity (79571449) here
  // describe("Graceful Charity (79571449)", () => { ... });
});
