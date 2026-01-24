import { describe, it, expect } from "vitest";
import { SummonMonsterCommand } from "$lib/domain/commands/SummonMonsterCommand";
import { createMockGameState } from "../../../__testUtils__/gameStateFactory";
import type { CardInstance } from "$lib/domain/models/Card";

describe("SummonMonsterCommand", () => {
  const createMonsterCard = (instanceId: string): CardInstance => ({
    instanceId,
    id: 12345678,
    name: "Test Monster",
    type: "monster",
    frameType: "normal",
    desc: "A test monster",
    atk: 1500,
    def: 1000,
    level: 4,
    race: "Warrior",
    attribute: "LIGHT",
    location: "hand",
    placedThisTurn: false,
  });

  describe("canExecute", () => {
    it("should return true when all conditions are met", () => {
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

      const command = new SummonMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should return false if game is over", () => {
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
        result: { isGameOver: true, winner: "player" },
      });

      const command = new SummonMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should return false if not in Main1 phase", () => {
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

      const command = new SummonMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should return false if summon limit reached", () => {
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

      const command = new SummonMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should return false if card not found", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SummonMonsterCommand("non-existent-id");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should return false if card is not in hand", () => {
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

      const command = new SummonMonsterCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should return false if card is not a monster", () => {
      // Arrange
      const spellCard: CardInstance = {
        instanceId: "spell-1",
        id: 67616300,
        name: "Test Spell",
        type: "spell",
        frameType: "spell",
        desc: "A test spell",
        race: "Normal",
        location: "hand",
        placedThisTurn: false,
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

      const command = new SummonMonsterCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should return false if mainMonsterZone is full", () => {
      // Arrange
      const monsterCard = createMonsterCard("monster-new");
      const fullMonsterZone = Array.from({ length: 5 }, (_, i) => ({
        ...createMonsterCard(`monster-${i}`),
        location: "mainMonsterZone" as const,
        position: "faceUp" as const,
        battlePosition: "attack" as const,
      }));

      const state = createMockGameState({
        phase: "Main1",
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        zones: {
          deck: [],
          hand: [monsterCard],
          mainMonsterZone: fullMonsterZone,
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SummonMonsterCommand("monster-new");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("should successfully summon monster to mainMonsterZone in attack position", () => {
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

      const command = new SummonMonsterCommand("monster-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.hand.length).toBe(0);
      expect(result.updatedState.zones.mainMonsterZone.length).toBe(1);

      const summonedCard = result.updatedState.zones.mainMonsterZone[0];
      expect(summonedCard.instanceId).toBe("monster-1");
      expect(summonedCard.location).toBe("mainMonsterZone");
      expect(summonedCard.position).toBe("faceUp");
      expect(summonedCard.battlePosition).toBe("attack");
      expect(summonedCard.placedThisTurn).toBe(true);
    });

    it("should increment normalSummonUsed", () => {
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

      const command = new SummonMonsterCommand("monster-1");

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

      const command = new SummonMonsterCommand("monster-1");

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

      const command = new SummonMonsterCommand("monster-1");

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
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SummonMonsterCommand("non-existent-id");

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

      const command = new SummonMonsterCommand("monster-1");

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
        name: "Test Spell",
        type: "spell",
        frameType: "spell",
        desc: "A test spell",
        race: "Normal",
        location: "hand",
        placedThisTurn: false,
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

      const command = new SummonMonsterCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("モンスターカードではありません");
    });

    it("should preserve other zones when summoning", () => {
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

      const command = new SummonMonsterCommand("monster-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.deck.length).toBe(1);
      expect(result.updatedState.zones.graveyard.length).toBe(1);
      expect(result.updatedState.zones.mainMonsterZone.length).toBe(1);
    });
  });

  describe("getCardInstanceId", () => {
    it("should return the card instance ID", () => {
      // Arrange
      const command = new SummonMonsterCommand("monster-1");

      // Act
      const result = command.getCardInstanceId();

      // Assert
      expect(result).toBe("monster-1");
    });
  });
});
