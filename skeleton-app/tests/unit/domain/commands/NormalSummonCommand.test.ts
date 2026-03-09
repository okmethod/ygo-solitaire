/**
 * Unit tests for NormalSummonCommand
 *
 * Tests the unified NormalSummonCommand which handles both summoning (attack position)
 * and setting (defense position) monster cards, consuming one normal summon right.
 */

import { describe, it, expect } from "vitest";
import { NormalSummonCommand } from "$lib/domain/commands/NormalSummonCommand";
import {
  createMockGameState,
  createTestMonsterCard,
  createTestSpellCard,
} from "../../../__testUtils__/gameStateFactory";

describe("NormalSummonCommand", () => {
  // ===========================
  // Summon Mode (Attack Position)
  // ===========================
  describe("summon mode", () => {
    describe("canExecute", () => {
      it("should return true when all conditions are met", () => {
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

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(true);
      });

      it("should return false if game is over", () => {
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
          result: { isGameOver: true, winner: "player" },
        });

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("should return false if not in main phase", () => {
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

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("should return false if summon limit reached", () => {
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

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("should return false if card not found", () => {
        const state = createMockGameState({
          phase: "main1",
          normalSummonLimit: 1,
          normalSummonUsed: 0,
          space: {
            mainDeck: [],
            extraDeck: [],
            hand: [],
            mainMonsterZone: [],
            spellTrapZone: [],
            fieldZone: [],
            graveyard: [],
            banished: [],
          },
        });

        const command = new NormalSummonCommand("non-existent-id", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("should return false if card is not in hand", () => {
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

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("should return false if card is not a monster", () => {
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

        const command = new NormalSummonCommand("spell-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("should return false if mainMonsterZone is full", () => {
        const monsterCard = createTestMonsterCard("monster-new");
        const fullMonsterZone = Array.from({ length: 5 }, (_, i) => ({
          ...createTestMonsterCard(`monster-${i}`),
          location: "mainMonsterZone" as const,
          position: "faceUp" as const,
          battlePosition: "attack" as const,
        }));

        const state = createMockGameState({
          phase: "main1",
          normalSummonLimit: 1,
          normalSummonUsed: 0,
          space: {
            mainDeck: [],
            extraDeck: [],
            hand: [monsterCard],
            mainMonsterZone: fullMonsterZone,
            spellTrapZone: [],
            fieldZone: [],
            graveyard: [],
            banished: [],
          },
        });

        const command = new NormalSummonCommand("monster-new", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });
    });

    describe("execute", () => {
      it("should successfully summon monster to mainMonsterZone in attack position", () => {
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

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.execute(state);

        expect(result.success).toBe(true);
        expect(result.updatedState.space.hand.length).toBe(0);
        expect(result.updatedState.space.mainMonsterZone.length).toBe(1);

        const summonedCard = result.updatedState.space.mainMonsterZone[0];
        expect(summonedCard.instanceId).toBe("monster-1");
        expect(summonedCard.location).toBe("mainMonsterZone");
        expect(summonedCard.stateOnField?.position).toBe("faceUp");
        expect(summonedCard.stateOnField?.battlePosition).toBe("attack");
        expect(summonedCard.stateOnField?.placedThisTurn).toBe(true);
      });

      it("should increment normalSummonUsed", () => {
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

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.execute(state);

        expect(result.success).toBe(true);
        expect(result.updatedState.normalSummonUsed).toBe(1);
      });

      it("should fail if not in main phase", () => {
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

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.execute(state);

        expect(result.success).toBe(false);
        expect(result.error).toBe("メインフェイズではありません");
      });
    });
  });

  // ===========================
  // Set Mode (Defense Position)
  // ===========================
  describe("set mode", () => {
    describe("canExecute", () => {
      it("should allow setting a monster when conditions are met", () => {
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

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(true);
      });

      it("should fail if game is already over", () => {
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

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("should fail if mainMonsterZone is full (5 cards)", () => {
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

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });
    });

    describe("execute", () => {
      it("should successfully set monster from hand to mainMonsterZone face-down", () => {
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

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.execute(state);

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

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.execute(state);

        expect(result.success).toBe(true);
        expect(result.updatedState.normalSummonUsed).toBe(1);
      });

      it("should preserve other zones when setting", () => {
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

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.execute(state);

        expect(result.success).toBe(true);
        expect(result.updatedState.space.mainDeck).toEqual([existingDeckCard]);
        expect(result.updatedState.space.graveyard).toEqual([existingGraveyardCard]);
      });
    });
  });

  // ===========================
  // Helper Methods
  // ===========================
  describe("getCardInstanceId", () => {
    it("should return the card instance ID", () => {
      const command = new NormalSummonCommand("monster-1", "summon");
      expect(command.getCardInstanceId()).toBe("monster-1");
    });
  });

  describe("getMode", () => {
    it("should return 'summon' for summon mode", () => {
      const command = new NormalSummonCommand("monster-1", "summon");
      expect(command.getMode()).toBe("summon");
    });

    it("should return 'set' for set mode", () => {
      const command = new NormalSummonCommand("monster-1", "set");
      expect(command.getMode()).toBe("set");
    });
  });
});
