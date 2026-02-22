/**
 * Unit tests for ActivateIgnitionEffectCommand
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ActivateIgnitionEffectCommand } from "$lib/domain/commands/ActivateIgnitionEffectCommand";
import { createMockGameState } from "../../../__testUtils__/gameStateFactory";
import type { GameSnapshot } from "$lib/domain/models/GameState";
// Note: ChainableActionRegistry は setup.ts で初期化済み

describe("ActivateIgnitionEffectCommand", () => {
  let initialState: GameSnapshot;
  const chickenGameInstanceId = "field-chickengame-1";

  beforeEach(() => {
    // Create state with Chicken Game face-up on field during Main1 phase
    initialState = createMockGameState({
      phase: "main1",
      lp: { player: 5000, opponent: 5000 },
      space: {
        mainDeck: [
          {
            instanceId: "main-0",
            id: 1001,
            jaName: "サンプルカード",
            type: "spell" as const,
            frameType: "spell" as const,
            location: "mainDeck" as const,
          },
        ],
        extraDeck: [],
        hand: [],
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [
          {
            instanceId: chickenGameInstanceId,
            id: 67616300, // Chicken Game
            jaName: "チキンゲーム",
            type: "spell" as const,
            frameType: "spell" as const,
            spellType: "field" as const,
            location: "fieldZone" as const,
            stateOnField: {
              position: "faceUp" as const,
              placedThisTurn: false,
              counters: [],
              activatedEffects: new Set(),
            },
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

      expect(command.canExecute(initialState).isValid).toBe(true);
    });

    it("should return false when card does not exist", () => {
      const command = new ActivateIgnitionEffectCommand("non-existent-card");

      expect(command.canExecute(initialState).isValid).toBe(false);
    });

    it("should return false when card is face-down", () => {
      const faceDownState = createMockGameState({
        phase: "main1",
        lp: { player: 5000, opponent: 5000 },
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: chickenGameInstanceId,
              id: 67616300,
              jaName: "チキンゲーム",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "field" as const,
              location: "fieldZone" as const,
              stateOnField: {
                position: "faceDown" as const,
                placedThisTurn: false,
                counters: [],
                activatedEffects: new Set(),
              },
            },
          ],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(faceDownState).isValid).toBe(false);
    });

    it("should return false when card is not on field", () => {
      const handState = createMockGameState({
        phase: "main1",
        lp: { player: 5000, opponent: 5000 },
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [
            {
              instanceId: chickenGameInstanceId,
              id: 67616300,
              jaName: "チキンゲーム",
              type: "spell" as const,
              frameType: "spell" as const,
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

      expect(command.canExecute(handState).isValid).toBe(false);
    });

    it("should return false when game is over", () => {
      const gameOverState = createMockGameState({
        phase: "main1",
        lp: { player: 5000, opponent: 5000 },
        result: {
          isGameOver: true,
          winner: "player" as const,
          reason: "exodia" as const,
        },
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: chickenGameInstanceId,
              id: 67616300,
              jaName: "チキンゲーム",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "field" as const,
              location: "fieldZone" as const,
              stateOnField: {
                position: "faceUp" as const,
                placedThisTurn: false,
                counters: [],
                activatedEffects: new Set(),
              },
            },
          ],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(gameOverState).isValid).toBe(false);
    });

    it("should return false when card has no registered ignition effect", () => {
      const noEffectState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: "field-spell-1",
              id: 9999999, // Unknown card
              jaName: "未知のカード",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "field" as const,
              location: "fieldZone" as const,
              stateOnField: {
                position: "faceUp" as const,
                placedThisTurn: false,
                counters: [],
                activatedEffects: new Set(),
              },
            },
          ],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand("field-spell-1");

      expect(command.canExecute(noEffectState).isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("should successfully activate ignition effect and return effectSteps", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      expect(result.updatedState).toBeDefined();
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBeGreaterThan(0);
      expect(result.message).toContain("Ignition effect activated");
    });

    it("should return failure when card does not exist", () => {
      const command = new ActivateIgnitionEffectCommand("non-existent-card");

      const result = command.execute(initialState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");
    });

    it("should return failure when card has no ignition effect", () => {
      const noEffectState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: "field-spell-1",
              id: 9999999,
              jaName: "未知のカード",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "field" as const,
              location: "fieldZone" as const,
              stateOnField: {
                position: "faceUp" as const,
                placedThisTurn: false,
                counters: [],
                activatedEffects: new Set(),
              },
            },
          ],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand("field-spell-1");

      const result = command.execute(noEffectState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("このカードには起動効果がありません");
    });

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
      expect(result.chainBlock).toBeDefined();
      // Chicken Game: effectSteps = activation steps only (発動通知 + LP payment)
      expect(result.effectSteps!.length).toBe(2);
      // chainBlock.resolutionSteps = resolution steps (draw)
      expect(result.chainBlock!.resolutionSteps.length).toBe(1);
    });

    it("should record activation in stateOnField.activatedEffects", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      // コマンド実行時に発動記録が stateOnField.activatedEffects に行われる
      const chickenGameCard = result.updatedState.space.fieldZone[0];
      expect(chickenGameCard.stateOnField?.activatedEffects.has("ignition-67616300-1")).toBe(true);
    });
  });

  describe("getCardInstanceId", () => {
    it("should return the card instance ID", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.getCardInstanceId()).toBe(chickenGameInstanceId);
    });
  });

  // ===========================
  // Integration: Royal Magical Library (王立魔法図書館)
  // ===========================
  describe("Royal Magical Library integration", () => {
    const royalLibraryInstanceId = "monster-royal-library-1";
    const ROYAL_MAGICAL_LIBRARY_ID = 70791313;

    let libraryState: GameSnapshot;

    beforeEach(() => {
      // Create state with Royal Magical Library face-up attack on monster zone with 3 spell counters
      libraryState = createMockGameState({
        phase: "main1",
        lp: { player: 8000, opponent: 8000 },
        space: {
          mainDeck: [
            {
              instanceId: "main-0",
              id: 1001,
              jaName: "サンプルカード",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "mainDeck" as const,
            },
            {
              instanceId: "deck-1",
              id: 1002,
              jaName: "サンプルカード2",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "mainDeck" as const,
            },
          ],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [
            {
              instanceId: royalLibraryInstanceId,
              id: ROYAL_MAGICAL_LIBRARY_ID,
              jaName: "王立魔法図書館",
              type: "monster" as const,
              frameType: "effect" as const,
              location: "mainMonsterZone" as const,
              stateOnField: {
                position: "faceUp" as const,
                battlePosition: "attack" as const,
                placedThisTurn: false,
                counters: [{ type: "spell", count: 3 }],
                activatedEffects: new Set(),
              },
            },
          ],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
    });

    describe("canExecute", () => {
      it("should return true when Royal Magical Library can activate its ignition effect", () => {
        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        expect(command.canExecute(libraryState).isValid).toBe(true);
      });

      it("should return true when Royal Magical Library is in defense position (ignition effects work in any battle position)", () => {
        const defenseState = createMockGameState({
          phase: "main1",
          lp: { player: 8000, opponent: 8000 },
          space: {
            mainDeck: libraryState.space.mainDeck,
            extraDeck: [],
            hand: [],
            mainMonsterZone: [
              {
                instanceId: royalLibraryInstanceId,
                id: ROYAL_MAGICAL_LIBRARY_ID,
                jaName: "王立魔法図書館",
                type: "monster" as const,
                frameType: "effect" as const,
                location: "mainMonsterZone" as const,
                stateOnField: {
                  position: "faceUp" as const,
                  battlePosition: "defense" as const,
                  placedThisTurn: false,
                  counters: [{ type: "spell", count: 3 }],
                  activatedEffects: new Set(),
                },
              },
            ],
            spellTrapZone: [],
            fieldZone: [],
            graveyard: [],
            banished: [],
          },
        });

        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        // Ignition effects can be activated in any battle position as long as the card is face-up
        expect(command.canExecute(defenseState).isValid).toBe(true);
      });

      it("should return true even after previous activation (no once-per-turn restriction)", () => {
        // Royal Magical Library has no once-per-turn restriction
        // In the real game, the cost (3 Spell Counters) limits activations
        const activatedState = createMockGameState({
          phase: "main1",
          lp: { player: 8000, opponent: 8000 },
          space: libraryState.space,
        });

        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        // Should still be able to activate
        expect(command.canExecute(activatedState).isValid).toBe(true);
      });
    });

    describe("execute", () => {
      it("should successfully activate Royal Magical Library ignition effect and return effectSteps", () => {
        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        const result = command.execute(libraryState);

        expect(result.success).toBe(true);
        expect(result.updatedState).toBeDefined();
        expect(result.effectSteps).toBeDefined();
        expect(result.effectSteps!.length).toBeGreaterThan(0);
        expect(result.message).toContain("Ignition effect activated");
      });

      it("should include notify, counter removal, and resolution steps", () => {
        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        const result = command.execute(libraryState);

        expect(result.success).toBe(true);
        expect(result.effectSteps).toBeDefined();
        expect(result.chainBlock).toBeDefined();
        // Royal Magical Library: effectSteps = activation steps only (発動通知 + カウンター消費)
        expect(result.effectSteps!.length).toBe(2);
        // chainBlock.resolutionSteps = resolution steps (draw)
        expect(result.chainBlock!.resolutionSteps.length).toBe(1);
      });

      it("should draw 1 card after executing all steps", () => {
        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        const result = command.execute(libraryState);

        expect(result.success).toBe(true);
        expect(result.effectSteps).toBeDefined();
        expect(result.chainBlock).toBeDefined();

        // Execute all steps: effectSteps (activation) + chainBlock.resolutionSteps (resolution)
        let currentState = result.updatedState;
        for (const step of result.effectSteps!) {
          const stepResult = step.action(currentState);
          expect(stepResult.success).toBe(true);
          currentState = stepResult.updatedState;
        }
        for (const step of result.chainBlock!.resolutionSteps) {
          const stepResult = step.action(currentState);
          expect(stepResult.success).toBe(true);
          currentState = stepResult.updatedState;
        }

        // Verify draw occurred
        expect(currentState.space.hand).toHaveLength(1);
        expect(currentState.space.mainDeck).toHaveLength(1); // Started with 2
      });
    });
  });

  // ===========================
  // Integration: Multiple Cards with Ignition Effects
  // ===========================
  describe("generic ignition effect handling", () => {
    it("should handle both Chicken Game and Royal Magical Library independently", () => {
      const chickenGameId = "field-chickengame-1";
      const royalLibraryId = "monster-royal-library-1";

      const mixedState = createMockGameState({
        phase: "main1",
        lp: { player: 5000, opponent: 5000 },
        space: {
          mainDeck: [
            {
              instanceId: "main-0",
              id: 1001,
              jaName: "サンプルカード",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "mainDeck" as const,
            },
          ],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [
            {
              instanceId: royalLibraryId,
              id: 70791313,
              jaName: "王立魔法図書館",
              type: "monster" as const,
              frameType: "effect" as const,
              location: "mainMonsterZone" as const,
              stateOnField: {
                position: "faceUp" as const,
                battlePosition: "attack" as const,
                placedThisTurn: false,
                counters: [{ type: "spell", count: 3 }],
                activatedEffects: new Set(),
              },
            },
          ],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: chickenGameId,
              id: 67616300,
              jaName: "チキンゲーム",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "field" as const,
              location: "fieldZone" as const,
              stateOnField: {
                position: "faceUp" as const,
                placedThisTurn: false,
                counters: [],
                activatedEffects: new Set(),
              },
            },
          ],
          graveyard: [],
          banished: [],
        },
      });

      // Both cards should be able to activate their ignition effects
      const chickenCommand = new ActivateIgnitionEffectCommand(chickenGameId);
      const libraryCommand = new ActivateIgnitionEffectCommand(royalLibraryId);

      expect(chickenCommand.canExecute(mixedState).isValid).toBe(true);
      expect(libraryCommand.canExecute(mixedState).isValid).toBe(true);

      // Activating one should not affect the other's ability to activate
      const chickenResult = chickenCommand.execute(mixedState);
      expect(chickenResult.success).toBe(true);

      // Execute Chicken Game's activation steps to record it
      let stateAfterChicken = chickenResult.updatedState;
      for (const step of chickenResult.effectSteps!) {
        const stepResult = step.action(stateAfterChicken);
        if (stepResult.success) {
          stateAfterChicken = stepResult.updatedState;
        }
      }

      // Royal Magical Library should still be able to activate
      expect(libraryCommand.canExecute(stateAfterChicken).isValid).toBe(true);
    });
  });
});
