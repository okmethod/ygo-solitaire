/**
 * Unit tests for SetSpellTrapCommand
 *
 * Tests the SetSpellTrapCommand which sets a spell or trap card face-down
 * to either the spellTrapZone or fieldZone (for field spells).
 * Setting does NOT consume normal summon rights.
 */

import { describe, it, expect } from "vitest";
import { SetSpellTrapCommand } from "$lib/domain/commands/SetSpellTrapCommand";
import type { CardInstance } from "$lib/domain/models/Card";
import { createMockGameState } from "../../../__testUtils__/gameStateFactory";

// Helper to create a normal spell card
function createNormalSpellCard(instanceId: string): CardInstance {
  return {
    instanceId,
    id: 67616300,
    jaName: "Upstart Goblin",
    type: "spell" as const,
    frameType: "spell",
    spellType: "normal",
    location: "hand" as const,
  };
}

// Helper to create a quick-play spell card
function createQuickPlaySpellCard(instanceId: string): CardInstance {
  return {
    instanceId,
    id: 12580477,
    jaName: "Raigeki Break",
    type: "spell" as const,
    frameType: "spell",
    spellType: "quick-play",
    location: "hand" as const,
  };
}

// Helper to create a field spell card
function createFieldSpellCard(instanceId: string): CardInstance {
  return {
    instanceId,
    id: 67616301,
    jaName: "Chicken Game",
    type: "spell" as const,
    frameType: "spell",
    spellType: "field",
    location: "hand" as const,
  };
}

// Helper to create a continuous spell card
function createContinuousSpellCard(instanceId: string): CardInstance {
  return {
    instanceId,
    id: 67616302,
    jaName: "Test Continuous",
    type: "spell" as const,
    frameType: "spell",
    spellType: "continuous",
    location: "hand" as const,
  };
}

describe("SetSpellTrapCommand", () => {
  describe("canExecute", () => {
    it("should allow setting a normal spell when conditions are met", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "main1",
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

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should allow setting a field spell even if fieldZone is occupied", () => {
      // Arrange
      const fieldSpell1 = createFieldSpellCard("field-1");
      const fieldSpell2 = { ...createFieldSpellCard("field-2"), location: "fieldZone" as const };
      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [fieldSpell1],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [fieldSpell2],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetSpellTrapCommand("field-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should fail if not in main1 phase", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "draw",
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

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if spellTrapZone is full (5 cards)", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const existingSpells = Array.from({ length: 5 }, (_, i) => createNormalSpellCard(`existing-${i}`));
      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [spellCard],
          mainMonsterZone: [],
          spellTrapZone: existingSpells,
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if card not found", () => {
      // Arrange
      const state = createMockGameState({
        phase: "main1",
      });

      const command = new SetSpellTrapCommand("non-existent-id");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if card is not in hand", () => {
      // Arrange
      const spellCard = { ...createNormalSpellCard("spell-1"), location: "mainDeck" as const };
      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [spellCard],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if card is not a spell or trap", () => {
      // Arrange
      const monsterCard: CardInstance = {
        instanceId: "monster-1",
        id: 33396948,
        jaName: "Exodia the Forbidden One",
        type: "monster" as const,
        frameType: "effect",
        location: "hand" as const,
      };
      const state = createMockGameState({
        phase: "main1",
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

      const command = new SetSpellTrapCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if game is already over", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "main1",
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
        result: { isGameOver: true, winner: "player", reason: "exodia" },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("should successfully set normal spell to spellTrapZone face-down", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "main1",
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

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(0);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);

      const setCard = result.updatedState.space.spellTrapZone[0];
      expect(setCard.instanceId).toBe("spell-1");
      expect(setCard.location).toBe("spellTrapZone");
      expect(setCard.stateOnField?.position).toBe("faceDown");
      expect(setCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("should successfully set quick-play spell to spellTrapZone face-down", () => {
      // Arrange
      const spellCard = createQuickPlaySpellCard("quick-1");
      const state = createMockGameState({
        phase: "main1",
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

      const command = new SetSpellTrapCommand("quick-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);

      const setCard = result.updatedState.space.spellTrapZone[0];
      expect(setCard.instanceId).toBe("quick-1");
      expect(setCard.stateOnField?.position).toBe("faceDown");
      expect(setCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("should successfully set continuous spell to spellTrapZone face-down", () => {
      // Arrange
      const spellCard = createContinuousSpellCard("continuous-1");
      const state = createMockGameState({
        phase: "main1",
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

      const command = new SetSpellTrapCommand("continuous-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);

      const setCard = result.updatedState.space.spellTrapZone[0];
      expect(setCard.instanceId).toBe("continuous-1");
      expect(setCard.stateOnField?.position).toBe("faceDown");
    });

    it("should successfully set field spell to fieldZone face-down", () => {
      // Arrange
      const fieldSpell = createFieldSpellCard("field-1");
      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [fieldSpell],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetSpellTrapCommand("field-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(0);
      expect(result.updatedState.space.fieldZone.length).toBe(1);

      const setCard = result.updatedState.space.fieldZone[0];
      expect(setCard.instanceId).toBe("field-1");
      expect(setCard.location).toBe("fieldZone");
      expect(setCard.stateOnField?.position).toBe("faceDown");
      expect(setCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("should replace existing field spell when setting a new field spell", () => {
      // Arrange
      const oldFieldSpell = {
        ...createFieldSpellCard("field-old"),
        location: "fieldZone" as const,
        stateOnField: {
          position: "faceUp" as const,
          counters: [],
          activatedEffects: new Set<string>(),
          placedThisTurn: false,
        },
      };
      const newFieldSpell = createFieldSpellCard("field-new");
      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [newFieldSpell],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [oldFieldSpell],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetSpellTrapCommand("field-new");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.fieldZone.length).toBe(1);
      expect(result.updatedState.space.fieldZone[0].instanceId).toBe("field-new");
      expect(result.updatedState.space.graveyard.length).toBe(1);
      expect(result.updatedState.space.graveyard[0].instanceId).toBe("field-old");
    });

    it("should NOT consume normalSummonUsed when setting spell", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "main1",
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

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.normalSummonUsed).toBe(0); // Should NOT increment
    });

    it("should fail if not in main1 phase", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "draw",
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

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });

    it("should fail if card not found", () => {
      // Arrange
      const state = createMockGameState({
        phase: "main1",
      });

      const command = new SetSpellTrapCommand("non-existent-id");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");
    });

    it("should fail if card is not in hand", () => {
      // Arrange
      const spellCard = { ...createNormalSpellCard("spell-1"), location: "mainDeck" as const };
      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [spellCard],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが手札にありません");
    });

    it("should fail if spellTrapZone is full", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const existingSpells = Array.from({ length: 5 }, (_, i) => ({
        ...createNormalSpellCard(`existing-${i}`),
        location: "spellTrapZone" as const,
      }));
      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [spellCard],
          mainMonsterZone: [],
          spellTrapZone: existingSpells,
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("魔法・罠ゾーンに空きがありません");
    });

    it("should preserve other zones when setting", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const existingDeckCard = createNormalSpellCard("deck-card");
      const existingGraveyardCard = createNormalSpellCard("gy-card");

      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [existingDeckCard],
          extraDeck: [],
          hand: [spellCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [existingGraveyardCard],
          banished: [],
        },
      });

      const command = new SetSpellTrapCommand("spell-1");

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
      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.getCardInstanceId();

      // Assert
      expect(result).toBe("spell-1");
    });
  });
});
