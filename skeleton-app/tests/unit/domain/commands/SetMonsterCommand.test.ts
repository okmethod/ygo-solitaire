/**
 * Unit tests for SetMonsterCommand
 *
 * Tests the SetMonsterCommand which sets a monster card face-down in defense position
 * to the mainMonsterZone, consuming one normal summon right.
 */

import { describe, it, expect } from "vitest";
import { SetMonsterCommand } from "$lib/domain/commands/SetMonsterCommand";
import type { GameState } from "$lib/domain/models/GameStateOld";
import type { CardInstance } from "$lib/domain/models/CardOld";
import { ExodiaNonEffect } from "$lib/domain/effects/rules/monsters/ExodiaNonEffect";

// Helper to create a mock GameState
function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  const defaultState: GameState = {
    zones: {
      deck: [],
      hand: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    lp: { player: 8000, opponent: 8000 },
    phase: "Main1",
    turn: 1,
    result: { isGameOver: false },
    activatedOncePerTurnCards: new Set<number>(),
    pendingEndPhaseEffects: [],
    damageNegation: false,
    normalSummonLimit: 1,
    normalSummonUsed: 0,
  };

  return { ...defaultState, ...overrides };
}

// Helper to create a monster card
function createMonsterCard(instanceId: string): CardInstance {
  const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
  return {
    instanceId,
    id: exodiaIds[0],
    jaName: "Test Monster",
    type: "monster" as const,
    frameType: "effect",
    location: "hand" as const,
  };
}

describe("SetMonsterCommand", () => {
  describe("canExecute", () => {
    it("should allow setting a monster when conditions are met", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should fail if not in Main1 phase", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "Draw",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if summon limit reached", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 1,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if mainMonsterZone is full (5 cards)", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const existingMonsters = Array.from({ length: 5 }, (_, i) => createMonsterCard(`existing-${i}`));
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: existingMonsters,
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if card not found", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
      });

      const command = new SetMonsterCommand("non-existent-id");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if card is not in hand", () => {
      // Arrange
      const monsterCard = { ...createMonsterCard("monster-1"), location: "deck" as const };
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [monsterCard],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if card is not a monster", () => {
      // Arrange
      const spellCard: CardInstance = {
        instanceId: "spell-1",
        id: 67616300,
        jaName: "Test Spell",
        type: "spell" as const,
        frameType: "normal",
        location: "hand" as const,
      };
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [spellCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if game is already over", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
        result: { isGameOver: true, winner: "player", reason: "exodia" },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("should successfully set monster from hand to mainMonsterZone face-down", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.hand.length).toBe(0);
      expect(result.updatedState.zones.mainMonsterZone.length).toBe(1);

      const setCard = result.updatedState.zones.mainMonsterZone[0];
      expect(setCard.instanceId).toBe("monster-1");
      expect(setCard.location).toBe("mainMonsterZone");
      expect(setCard.stateOnField?.position).toBe("faceDown");
      expect(setCard.stateOnField?.battlePosition).toBe("defense");
      expect(setCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("should increment normalSummonUsed when setting a monster", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.normalSummonUsed).toBe(1);
    });

    it("should fail if not in Main1 phase", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "Draw",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });

    it("should fail if summon limit reached", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 1,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("should fail if card not found", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
      });

      const command = new SetMonsterCommand("non-existent-id");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");
    });

    it("should fail if card is not in hand", () => {
      // Arrange
      const monsterCard = { ...createMonsterCard("monster-1"), location: "deck" as const };
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [monsterCard],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが手札にありません");
    });

    it("should fail if card is not a monster", () => {
      // Arrange
      const spellCard: CardInstance = {
        instanceId: "spell-1",
        id: 67616300,
        jaName: "Test Spell",
        type: "spell" as const,
        frameType: "normal",
        location: "hand" as const,
      };
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [spellCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("モンスターカードではありません");
    });

    it("should preserve other zones when setting", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-1");
      const existingDeckCard = createMonsterCard("deck-card");
      const existingGraveyardCard = createMonsterCard("gy-card");

      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [existingDeckCard],
          hand: [monsterCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [existingGraveyardCard],
          banished: [],
        },
      });

      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.deck).toEqual([existingDeckCard]);
      expect(result.updatedState.zones.graveyard).toEqual([existingGraveyardCard]);
    });
  });

  describe("getCardInstanceId", () => {
    it("should return the card instance id", () => {
      // Arrange
      const command = new SetMonsterCommand("monster-1");

      // Act
      const result = command.getCardInstanceId();

      // Assert
      expect(result).toBe("monster-1");
    });
  });
});
