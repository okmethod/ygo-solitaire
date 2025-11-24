/**
 * Unit tests for ActivateSpellCommand
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ActivateSpellCommand } from "$lib/application/commands/ActivateSpellCommand";
import { createMockGameState } from "$lib/__testUtils__/gameStateFactory";
import type { GameState } from "$lib/domain/models/GameState";

describe("ActivateSpellCommand", () => {
  let initialState: GameState;
  const spellCardId = "hand-spell-1";

  beforeEach(() => {
    // Create state with spell card in hand during Main1 phase
    initialState = createMockGameState({
      phase: "Main1",
      zones: {
        deck: [
          { instanceId: "deck-0", cardId: "card0", location: "deck" },
          { instanceId: "deck-1", cardId: "card1", location: "deck" },
        ],
        hand: [
          { instanceId: spellCardId, cardId: "pot-of-greed", location: "hand" },
          { instanceId: "hand-2", cardId: "card2", location: "hand" },
        ],
        field: [],
        graveyard: [],
        banished: [],
      },
    });
  });

  describe("canExecute", () => {
    it("should return true when spell can be activated (Main1 phase, card in hand)", () => {
      const command = new ActivateSpellCommand(spellCardId);

      expect(command.canExecute(initialState)).toBe(true);
    });

    it("should return false when card is not in hand", () => {
      const command = new ActivateSpellCommand("non-existent-card");

      expect(command.canExecute(initialState)).toBe(false);
    });

    it("should return false when not in Main1 phase", () => {
      const drawPhaseState = createMockGameState({
        phase: "Draw",
        zones: {
          deck: [],
          hand: [{ instanceId: spellCardId, cardId: "pot-of-greed", location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateSpellCommand(spellCardId);

      expect(command.canExecute(drawPhaseState)).toBe(false);
    });

    it("should return false when game is over", () => {
      const gameOverState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [{ instanceId: spellCardId, cardId: "pot-of-greed", location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
        result: {
          isGameOver: true,
          winner: "player",
          reason: "exodia",
          message: "Exodia victory!",
        },
      });

      const command = new ActivateSpellCommand(spellCardId);

      expect(command.canExecute(gameOverState)).toBe(false);
    });
  });

  describe("execute", () => {
    it("should successfully activate spell card (hand → field → graveyard)", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Spell card activated");

      // Check card moved from hand
      expect(result.newState.zones.hand.length).toBe(1);
      expect(result.newState.zones.hand.some((c) => c.instanceId === spellCardId)).toBe(false);

      // Check card ended up in graveyard (not field)
      expect(result.newState.zones.field.length).toBe(0);
      expect(result.newState.zones.graveyard.length).toBe(1);
      expect(result.newState.zones.graveyard.some((c) => c.instanceId === spellCardId)).toBe(true);
    });

    it("should fail when card is not in hand", () => {
      const command = new ActivateSpellCommand("non-existent-card");

      const result = command.execute(initialState);

      expect(result.success).toBe(false);
      expect(result.error).toContain("見つかりません");

      // State should remain unchanged
      expect(result.newState).toEqual(initialState);
    });

    it("should fail when not in Main1 phase", () => {
      const drawPhaseState = createMockGameState({
        phase: "Draw",
        zones: {
          deck: [],
          hand: [{ instanceId: spellCardId, cardId: "pot-of-greed", location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(drawPhaseState);

      expect(result.success).toBe(false);
      expect(result.error).toContain("メインフェイズでのみ発動できます");

      // State should remain unchanged
      expect(result.newState).toEqual(drawPhaseState);
    });

    it("should preserve other zones during activation", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);

      // Other zones should remain unchanged
      expect(result.newState.zones.deck).toEqual(initialState.zones.deck);
      expect(result.newState.zones.banished).toEqual(initialState.zones.banished);

      // Only hand and graveyard should change
      expect(result.newState.zones.hand.length).toBe(initialState.zones.hand.length - 1);
      expect(result.newState.zones.graveyard.length).toBe(initialState.zones.graveyard.length + 1);
    });

    it("should check victory conditions after activation", () => {
      // Create state with 4 Exodia pieces in hand + 1 on field (about to be sent to graveyard)
      const exodiaState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [
            { instanceId: spellCardId, cardId: "pot-of-greed", location: "hand" },
            { instanceId: "exodia-head", cardId: "8124921", location: "hand" }, // Exodia the Forbidden One
            { instanceId: "exodia-right-arm", cardId: "70903634", location: "hand" },
            { instanceId: "exodia-left-arm", cardId: "7902349", location: "hand" },
            { instanceId: "exodia-right-leg", cardId: "44519536", location: "hand" },
            { instanceId: "exodia-left-leg", cardId: "8124921", location: "hand" },
          ],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(exodiaState);

      expect(result.success).toBe(true);

      // Should check for Exodia victory (5 pieces in hand after spell activation)
      // Result state should have victory check applied
      expect(result.newState.result).toBeDefined();
    });

    it("should maintain immutability (original state unchanged)", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const originalHandLength = initialState.zones.hand.length;
      const originalGraveyardLength = initialState.zones.graveyard.length;

      command.execute(initialState);

      // Original state should remain unchanged
      expect(initialState.zones.hand.length).toBe(originalHandLength);
      expect(initialState.zones.graveyard.length).toBe(originalGraveyardLength);
    });
  });

  describe("getCardInstanceId", () => {
    it("should return the card instance ID being activated", () => {
      const command = new ActivateSpellCommand(spellCardId);

      expect(command.getCardInstanceId()).toBe(spellCardId);
    });
  });

  describe("description", () => {
    it("should have descriptive command description", () => {
      const command = new ActivateSpellCommand(spellCardId);

      expect(command.description).toContain("Activate spell card");
      expect(command.description).toContain(spellCardId);
    });
  });
});
