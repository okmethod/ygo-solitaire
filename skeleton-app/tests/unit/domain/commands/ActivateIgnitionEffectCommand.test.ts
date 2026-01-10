/**
 * Unit tests for ActivateIgnitionEffectCommand
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ActivateIgnitionEffectCommand } from "$lib/domain/commands/ActivateIgnitionEffectCommand";
import { createMockGameState } from "../../../__testUtils__/gameStateFactory";
import type { GameState } from "$lib/domain/models/GameState";
import "$lib/domain/effects"; // Initialize ChainableActionRegistry

describe("ActivateIgnitionEffectCommand", () => {
  let initialState: GameState;
  const chickenGameInstanceId = "field-chickengame-1";

  beforeEach(() => {
    // Create state with Chicken Game face-up on field during Main1 phase
    initialState = createMockGameState({
      phase: "Main1",
      playerLP: 5000,
      zones: {
        deck: [
          {
            instanceId: "deck-0",
            id: 1001,
            type: "spell" as const,
            frameType: "spell" as const,
            location: "deck" as const,
          },
        ],
        hand: [],
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [
          {
            instanceId: chickenGameInstanceId,
            id: 67616300, // Chicken Game
            type: "spell" as const,
            frameType: "field" as const,
            spellType: "field" as const,
            location: "fieldZone" as const,
            position: "faceUp" as const,
          },
        ],
        graveyard: [],
        banished: [],
      },
    });
  });

  describe("canExecute", () => {
    it("should return true when ignition effect can be activated (Main1 phase, face-up on field, LP >= 1000)", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(initialState)).toBe(true);
    });

    it("should return false when card does not exist", () => {
      const command = new ActivateIgnitionEffectCommand("non-existent-card");

      expect(command.canExecute(initialState)).toBe(false);
    });

    it("should return false when card is face-down", () => {
      const faceDownState = createMockGameState({
        phase: "Main1",
        playerLP: 5000,
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: chickenGameInstanceId,
              id: 67616300,
              type: "spell" as const,
              frameType: "field" as const,
              spellType: "field" as const,
              location: "fieldZone" as const,
              position: "faceDown" as const,
            },
          ],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(faceDownState)).toBe(false);
    });

    it("should return false when card is not on field", () => {
      const handState = createMockGameState({
        phase: "Main1",
        playerLP: 5000,
        zones: {
          deck: [],
          hand: [
            {
              instanceId: chickenGameInstanceId,
              id: 67616300,
              type: "spell" as const,
              frameType: "field" as const,
              spellType: "field" as const,
              location: "hand" as const,
            },
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(handState)).toBe(false);
    });

    it("should return false when game is over", () => {
      const gameOverState = createMockGameState({
        phase: "Main1",
        playerLP: 5000,
        result: {
          isGameOver: true,
          winner: "player" as const,
          reason: "Exodia" as const,
        },
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: chickenGameInstanceId,
              id: 67616300,
              type: "spell" as const,
              frameType: "field" as const,
              spellType: "field" as const,
              location: "fieldZone" as const,
              position: "faceUp" as const,
            },
          ],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(gameOverState)).toBe(false);
    });

    it("should return false when card has no registered ignition effect", () => {
      const noEffectState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: "field-spell-1",
              id: 9999999, // Unknown card
              type: "spell" as const,
              frameType: "field" as const,
              spellType: "field" as const,
              location: "fieldZone" as const,
              position: "faceUp" as const,
            },
          ],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand("field-spell-1");

      expect(command.canExecute(noEffectState)).toBe(false);
    });

    // TODO: Add more detailed tests when ChainableActionRegistry is extended
    // to support multiple actions per card. Current implementation is hardcoded
    // for Chicken Game only.
  });

  describe("execute", () => {
    it("should successfully activate ignition effect and return effectSteps", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      expect(result.newState).toBeDefined();
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBeGreaterThan(0);
      expect(result.message).toContain("Ignition effect activated");
    });

    it("should return failure when card does not exist", () => {
      const command = new ActivateIgnitionEffectCommand("non-existent-card");

      const result = command.execute(initialState);

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should return failure when card has no ignition effect", () => {
      const noEffectState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: "field-spell-1",
              id: 9999999,
              type: "spell" as const,
              frameType: "field" as const,
              spellType: "field" as const,
              location: "fieldZone" as const,
              position: "faceUp" as const,
            },
          ],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand("field-spell-1");

      const result = command.execute(noEffectState);

      expect(result.success).toBe(false);
      expect(result.error).toContain("no ignition effect");
    });

    // TODO: Add more detailed tests when ChainableActionRegistry is extended
    // to support multiple actions per card. Current implementation is hardcoded
    // for Chicken Game only, so card-specific tests belong in ChickenGameIgnitionEffect.test.ts

    it("should preserve immutability (original state unchanged)", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      const originalState = { ...initialState };
      command.execute(initialState);

      expect(initialState).toEqual(originalState);
    });

    it("should include both activation and resolution steps in effectSteps", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      // Chicken Game has: 2 activation steps (LP payment, once-per-turn) + 1 resolution step (draw)
      expect(result.effectSteps!.length).toBe(3);
    });
  });

  describe("getCardInstanceId", () => {
    it("should return the card instance ID", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.getCardInstanceId()).toBe(chickenGameInstanceId);
    });
  });
});
