/**
 * Unit tests for ActivateSpellCommand
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { createMockGameState } from "../../../__testUtils__/gameStateFactory";
import type { GameState } from "$lib/domain/models/GameState";
import "$lib/domain/effects"; // Initialize ChainableActionRegistry

describe("ActivateSpellCommand", () => {
  let initialState: GameState;
  const spellCardId = "hand-spell-1";

  beforeEach(() => {
    // Create state with spell card in hand during Main1 phase
    initialState = createMockGameState({
      phase: "Main1",
      zones: {
        deck: [
          {
            instanceId: "deck-0",
            id: 1001,
            type: "spell" as const,
            frameType: "spell" as const,
            location: "deck" as const,
          },
          {
            instanceId: "deck-1",
            id: 1002,
            type: "spell" as const,
            frameType: "spell" as const,
            location: "deck" as const,
          },
        ],
        hand: [
          {
            instanceId: spellCardId,
            id: 55144522,
            type: "spell" as const,
            frameType: "spell" as const,
            location: "hand" as const,
          }, // Pot of Greed
          {
            instanceId: "hand-2",
            id: 1003,
            type: "spell" as const,
            frameType: "spell" as const,
            location: "hand" as const,
          },
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
          hand: [
            {
              instanceId: spellCardId,
              id: 55144522,
              type: "spell" as const,
              frameType: "spell" as const,
              location: "hand" as const,
            },
          ],
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
          hand: [
            {
              instanceId: spellCardId,
              id: 55144522,
              type: "spell" as const,
              frameType: "spell" as const,
              location: "hand" as const,
            },
          ],
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
    it("should successfully activate spell card and return effectSteps", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Spell card activated");

      // Check card moved from hand
      expect(result.newState.zones.hand.length).toBe(1);
      expect(result.newState.zones.hand.some((c) => c.instanceId === spellCardId)).toBe(false);

      // Pot of Greed has registered effect in ChainableActionRegistry (new system)
      // Card stays on field (effect will send to graveyard later)
      expect(result.newState.zones.field.length).toBe(1);
      expect(result.newState.zones.field.some((c) => c.instanceId === spellCardId)).toBe(true);
      expect(result.newState.zones.graveyard.length).toBe(0);

      // NEW: Verify effectSteps are returned
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBeGreaterThan(0);
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
          hand: [
            {
              instanceId: spellCardId,
              id: 55144522,
              type: "spell" as const,
              frameType: "spell" as const,
              location: "hand" as const,
            },
          ],
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

      // Only hand and field should change (Pot of Greed has effect, so stays on field)
      expect(result.newState.zones.hand.length).toBe(initialState.zones.hand.length - 1);
      expect(result.newState.zones.field.length).toBe(initialState.zones.field.length + 1);
      expect(result.newState.zones.graveyard.length).toBe(initialState.zones.graveyard.length);
    });

    it("should check victory conditions after activation", () => {
      // Use an unregistered test spell card (no ChainableAction, will go straight to graveyard)
      const testSpellId = "test-spell-for-victory";

      // Create state with Exodia pieces in hand + 1 test spell card (no effect)
      const exodiaState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [
            {
              instanceId: testSpellId,
              id: 1001, // Test spell with no ChainableAction
              jaName: "Test Spell",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "hand" as const,
            },
            {
              instanceId: "exodia-head",
              id: 33396948,
              jaName: "封印されしエクゾディア",
              type: "monster" as const,
              frameType: "effect" as const,
              location: "hand" as const,
            }, // Exodia the Forbidden One
            {
              instanceId: "exodia-right-arm",
              id: 7902349,
              jaName: "封印されし者の右腕",
              type: "monster" as const,
              frameType: "normal" as const,
              location: "hand" as const,
            },
            {
              instanceId: "exodia-left-arm",
              id: 70903634,
              jaName: "封印されし者の左腕",
              type: "monster" as const,
              frameType: "normal" as const,
              location: "hand" as const,
            },
            {
              instanceId: "exodia-right-leg",
              id: 8124921,
              jaName: "封印されし者の右足",
              type: "monster" as const,
              frameType: "normal" as const,
              location: "hand" as const,
            },
            {
              instanceId: "exodia-left-leg",
              id: 44519536,
              jaName: "封印されし者の左足",
              type: "monster" as const,
              frameType: "normal" as const,
              location: "hand" as const,
            },
          ],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateSpellCommand(testSpellId);

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
