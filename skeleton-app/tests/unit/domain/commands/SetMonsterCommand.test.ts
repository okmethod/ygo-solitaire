/**
 * Unit tests for SetMonsterCommand
 *
 * Tests the SetMonsterCommand which sets a monster card face-down in defense position
 * to the mainMonsterZone, consuming one normal summon right.
 */

import { describe, it, expect } from "vitest";
import { SetMonsterCommand } from "$lib/domain/commands/SetMonsterCommand";
import {
  createMockGameState,
  createTestMonsterCard,
  createTestSpellCard,
} from "../../../__testUtils__/gameStateFactory";

describe("SetMonsterCommand", () => {
  describe("canExecute", () => {
    it("should allow setting a monster when conditions are met", () => {
      // Arrange
      const monsterCard = createTestMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
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

    it("should fail if not in main1 phase", () => {
      // Arrange
      const monsterCard = createTestMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "draw",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const monsterCard = createTestMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 1,
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const monsterCard = createTestMonsterCard("monster-1");
      const existingMonsters = Array.from({ length: 5 }, (_, i) => createTestMonsterCard(`existing-${i}`));
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
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
        phase: "main1",
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
      const monsterCard = { ...createTestMonsterCard("monster-1"), location: "mainDeck" as const };
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [monsterCard],
          extraDeck: [],
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
      const spellCard = createTestSpellCard("spell-1");
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const monsterCard = createTestMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const monsterCard = createTestMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
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
      expect(result.updatedState.space.hand.length).toBe(0);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);

      const setCard = result.updatedState.space.mainMonsterZone[0];
      expect(setCard.instanceId).toBe("monster-1");
      expect(setCard.location).toBe("mainMonsterZone");
      expect(setCard.stateOnField?.position).toBe("faceDown");
      expect(setCard.stateOnField?.battlePosition).toBe("defense");
      expect(setCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("should increment normalSummonUsed when setting a monster", () => {
      // Arrange
      const monsterCard = createTestMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
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

    it("should fail if not in main1 phase", () => {
      // Arrange
      const monsterCard = createTestMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "draw",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const monsterCard = createTestMonsterCard("monster-1");
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 1,
        space: {
          mainDeck: [],
          extraDeck: [],
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
        phase: "main1",
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
      const monsterCard = { ...createTestMonsterCard("monster-1"), location: "mainDeck" as const };
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [monsterCard],
          extraDeck: [],
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
      const spellCard = createTestSpellCard("spell-1");
      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const monsterCard = createTestMonsterCard("monster-1");
      const existingDeckCard = createTestMonsterCard("deck-card");
      const existingGraveyardCard = createTestMonsterCard("gy-card");

      const state = createMockGameState({
        phase: "main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        space: {
          mainDeck: [existingDeckCard],
          extraDeck: [],
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
      expect(result.updatedState.space.mainDeck).toEqual([existingDeckCard]);
      expect(result.updatedState.space.graveyard).toEqual([existingGraveyardCard]);
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
