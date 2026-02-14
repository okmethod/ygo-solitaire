/**
 * Unit tests for ActivateSpellCommand
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { createMockGameState } from "../../../__testUtils__/gameStateFactory";
import type { GameState } from "$lib/domain/models/GameStateOld";
import { initializeChainableActionRegistry } from "$lib/domain/effects/actions/index";

initializeChainableActionRegistry();

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
            jaName: "Test Card 1",
            type: "spell" as const,
            frameType: "spell" as const,
            location: "deck" as const,
          },
          {
            instanceId: "deck-1",
            id: 1002,
            jaName: "Test Card 2",
            type: "spell" as const,
            frameType: "spell" as const,
            location: "deck" as const,
          },
        ],
        hand: [
          {
            instanceId: spellCardId,
            id: 55144522,
            jaName: "強欲な壺",
            type: "spell" as const,
            frameType: "spell" as const,
            location: "hand" as const,
          }, // Pot of Greed
          {
            instanceId: "hand-2",
            id: 1003,
            jaName: "Test Card 3",
            type: "spell" as const,
            frameType: "spell" as const,
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
  });

  describe("canExecute", () => {
    it("should return true when spell can be activated (Main1 phase, card in hand)", () => {
      const command = new ActivateSpellCommand(spellCardId);

      expect(command.canExecute(initialState).isValid).toBe(true);
    });

    it("should return false when card is not in hand", () => {
      const command = new ActivateSpellCommand("non-existent-card");

      expect(command.canExecute(initialState).isValid).toBe(false);
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
              jaName: "強欲な壺",
              type: "spell" as const,
              frameType: "spell" as const,
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

      const command = new ActivateSpellCommand(spellCardId);

      expect(command.canExecute(drawPhaseState).isValid).toBe(false);
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
              jaName: "強欲な壺",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "hand" as const,
            },
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
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

      expect(command.canExecute(gameOverState).isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("should successfully activate spell card and return effectSteps", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Spell card activated");

      // Check card moved from hand
      expect(result.updatedState.zones.hand.length).toBe(1);
      expect(result.updatedState.zones.hand.some((c) => c.instanceId === spellCardId)).toBe(false);

      // Pot of Greed has registered effect in ChainableActionRegistry (new system)
      // Card stays on spellTrapZone (effect will send to graveyard later)
      expect(result.updatedState.zones.spellTrapZone.length).toBe(1);
      expect(result.updatedState.zones.spellTrapZone.some((c) => c.instanceId === spellCardId)).toBe(true);
      expect(result.updatedState.zones.graveyard.length).toBe(0);

      // NEW: Verify effectSteps are returned
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBeGreaterThan(0);
    });

    it("should fail when card is not in hand", () => {
      const command = new ActivateSpellCommand("non-existent-card");

      const result = command.execute(initialState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");

      // State should remain unchanged
      expect(result.updatedState).toEqual(initialState);
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
              jaName: "強欲な壺",
              type: "spell" as const,
              frameType: "spell" as const,
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

      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(drawPhaseState);

      expect(result.success).toBe(false);
      // Note: メインフェイズチェックは ChainableAction 側で行われ、詳細なエラーメッセージが返る
      expect(result.error).toBe("メインフェイズではありません");

      // State should remain unchanged
      expect(result.updatedState).toEqual(drawPhaseState);
    });

    it("should preserve other zones during activation", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);

      // Other zones should remain unchanged
      expect(result.updatedState.zones.deck).toEqual(initialState.zones.deck);
      expect(result.updatedState.zones.banished).toEqual(initialState.zones.banished);

      // Only hand and spellTrapZone should change (Pot of Greed has effect, so stays on spellTrapZone)
      expect(result.updatedState.zones.hand.length).toBe(initialState.zones.hand.length - 1);
      expect(result.updatedState.zones.spellTrapZone.length).toBe(initialState.zones.spellTrapZone.length + 1);
      expect(result.updatedState.zones.graveyard.length).toBe(initialState.zones.graveyard.length);
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

  describe("Zone separation (US1)", () => {
    it("should place field spell in fieldZone", () => {
      // Arrange: Field spell in hand (Chicken Game)
      const fieldSpellState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [
            {
              instanceId: "field-spell-1",
              id: 67616300, // Chicken Game
              jaName: "チキンレース",
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

      // Act
      const command = new ActivateSpellCommand("field-spell-1");
      const result = command.execute(fieldSpellState);

      // Assert: Field spell should be in fieldZone, not spellTrapZone
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.fieldZone.length).toBe(1);
      expect(result.updatedState.zones.spellTrapZone.length).toBe(0);
      expect(result.updatedState.zones.fieldZone[0].id).toBe(67616300);
    });

    it("should place normal spell in spellTrapZone", () => {
      // Arrange: Normal spell in hand (Pot of Greed)
      const normalSpellState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [
            {
              instanceId: "deck-0",
              id: 1001,
              jaName: "Test Card 1",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "deck" as const,
            },
            {
              instanceId: "deck-1",
              id: 1002,
              jaName: "Test Card 2",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "deck" as const,
            },
          ],
          hand: [
            {
              instanceId: "normal-spell-1",
              id: 55144522, // Pot of Greed
              jaName: "強欲な壺",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "normal" as const,
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

      // Act
      const command = new ActivateSpellCommand("normal-spell-1");
      const result = command.execute(normalSpellState);

      // Assert: Normal spell should be placed in spellTrapZone (not fieldZone)
      // The spell will remain in spellTrapZone until effect resolution in Application Layer
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.spellTrapZone.length).toBe(1);
      expect(result.updatedState.zones.fieldZone.length).toBe(0);
      expect(result.updatedState.zones.spellTrapZone[0].id).toBe(55144522);
    });

    it("should place continuous spell in spellTrapZone and keep it on field", () => {
      // Arrange: Continuous spell in hand (no effect registered, for testing zone placement)
      const continuousSpellState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [
            {
              instanceId: "continuous-spell-1",
              id: 99999998, // Unregistered continuous spell
              jaName: "未登録の永続魔法",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "continuous" as const,
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

      // Act
      const command = new ActivateSpellCommand("continuous-spell-1");
      const result = command.execute(continuousSpellState);

      // Assert: Continuous spell stays on field (not sent to graveyard)
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.spellTrapZone.length).toBe(1);
      expect(result.updatedState.zones.graveyard.length).toBe(0);
      expect(result.updatedState.zones.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
    });
  });

  describe("Set Card Activation", () => {
    it("should allow activating normal spell from spellTrapZone", () => {
      // Arrange: Normal spell set in spellTrapZone
      const setSpellState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [
            // Pot of Greed needs at least 2 cards in deck
            {
              instanceId: "deck-0",
              id: 1001,
              jaName: "Test Card 1",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "deck" as const,
            },
            {
              instanceId: "deck-1",
              id: 1002,
              jaName: "Test Card 2",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "deck" as const,
            },
          ],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [
            {
              instanceId: "set-spell-1",
              id: 55144522, // 強欲な壺 (normal spell)
              jaName: "強欲な壺",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "normal" as const,
              location: "spellTrapZone" as const,
              stateOnField: {
                position: "faceDown" as const,
                placedThisTurn: false,
                counters: [],
                activatedEffects: new Set(),
              },
            },
          ],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("set-spell-1");
      const result = command.execute(setSpellState);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.spellTrapZone.length).toBe(1);
      expect(result.updatedState.zones.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
    });

    it("should allow activating field spell from fieldZone", () => {
      // Arrange: Field spell set in fieldZone
      const setFieldSpellState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            {
              instanceId: "set-field-spell-1",
              id: 67616300, // Chicken Game (field spell)
              jaName: "チキンレース",
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

      // Act
      const command = new ActivateSpellCommand("set-field-spell-1");
      const result = command.execute(setFieldSpellState);

      // Assert: Field spell should be flipped face-up and stay in fieldZone
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.fieldZone.length).toBe(1);
      expect(result.updatedState.zones.fieldZone[0].stateOnField?.position).toBe("faceUp");
      expect(result.updatedState.zones.fieldZone[0].instanceId).toBe("set-field-spell-1");
      // Chicken Game has ignition effect, so effectSteps may be empty if no choice is made
      expect(result.effectSteps).toBeDefined();
    });

    it("should reject activating quick-play spell set this turn", () => {
      // Arrange: Quick-play spell set this turn
      const setQuickPlayState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [
            {
              instanceId: "set-quick-play-1",
              id: 74519184, // 手札断札 (quick-play)
              jaName: "手札断札",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "quick-play" as const,
              location: "spellTrapZone" as const,
              stateOnField: {
                position: "faceDown" as const,
                placedThisTurn: true, // Set this turn - should be blocked
                counters: [],
                activatedEffects: new Set(),
              },
            },
          ],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("set-quick-play-1");
      const result = command.execute(setQuickPlayState);

      // Assert
      expect(result.success).toBe(false);
      // Note: 速攻魔法のセットターン制限は ChainableAction 側で行われ、詳細なエラーメッセージが返る
      expect(result.error).toBe("速攻魔法はセットしたターンに発動できません");
    });

    it("should allow activating quick-play spell NOT set this turn", () => {
      // Arrange: Quick-play spell set previous turn (use unregistered ID to avoid activation conditions)
      const setQuickPlayState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [
            {
              instanceId: "set-quick-play-2",
              id: 99999997, // Unregistered quick-play spell
              jaName: "Test Quick-Play",
              type: "spell" as const,
              frameType: "spell" as const,
              spellType: "quick-play" as const,
              location: "spellTrapZone" as const,
              stateOnField: {
                position: "faceDown" as const,
                placedThisTurn: false, // NOT set this turn - should be allowed
                counters: [],
                activatedEffects: new Set(),
              },
            },
          ],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("set-quick-play-2");
      const result = command.execute(setQuickPlayState);

      // Assert: Activation succeeds (effectSteps is empty for unregistered cards)
      // Note: 墓地送りは ChainableAction 側で処理されるため、未登録カードでは effectSteps は空
      expect(result.success).toBe(true);
      expect(result.effectSteps).toHaveLength(0);
      // Game state: card moved to face-up position
      expect(result.updatedState.zones.spellTrapZone.length).toBe(1);
      expect(result.updatedState.zones.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
    });
  });
});
