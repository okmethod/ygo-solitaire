/**
 * Unit tests for SetSpellTrapCommand
 *
 * Tests the SetSpellTrapCommand which sets a spell or trap card face-down
 * to either the spellTrapZone or fieldZone (for field spells).
 * Setting does NOT consume normal summon rights.
 */

import { describe, it, expect } from "vitest";
import { SetSpellTrapCommand } from "$lib/domain/commands/SetSpellTrapCommand";
import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";

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
    chainStack: [],
    result: { isGameOver: false, winner: null, reason: null },
    activatedIgnitionEffectsThisTurn: new Set<string>(),
    activatedOncePerTurnCards: new Set<number>(),
    pendingEndPhaseEffects: [],
    damageNegation: false,
    normalSummonLimit: 1,
    normalSummonUsed: 0,
  };

  return { ...defaultState, ...overrides };
}

// Helper to create a normal spell card
function createNormalSpellCard(instanceId: string): CardInstance {
  return {
    instanceId,
    id: 67616300,
    name: "Upstart Goblin",
    type: "spell" as const,
    frameType: "spell",
    spellType: "normal",
    location: "hand" as const,
    position: undefined,
    placedThisTurn: false,
  };
}

// Helper to create a quick-play spell card
function createQuickPlaySpellCard(instanceId: string): CardInstance {
  return {
    instanceId,
    id: 12580477,
    name: "Raigeki Break",
    type: "spell" as const,
    frameType: "spell",
    spellType: "quick-play",
    location: "hand" as const,
    position: undefined,
    placedThisTurn: false,
  };
}

// Helper to create a field spell card
function createFieldSpellCard(instanceId: string): CardInstance {
  return {
    instanceId,
    id: 67616301,
    name: "Chicken Game",
    type: "spell" as const,
    frameType: "spell",
    spellType: "field",
    location: "hand" as const,
    position: undefined,
    placedThisTurn: false,
  };
}

// Helper to create a continuous spell card
function createContinuousSpellCard(instanceId: string): CardInstance {
  return {
    instanceId,
    id: 67616302,
    name: "Test Continuous",
    type: "spell" as const,
    frameType: "spell",
    spellType: "continuous",
    location: "hand" as const,
    position: undefined,
    placedThisTurn: false,
  };
}

describe("SetSpellTrapCommand", () => {
  describe("canExecute", () => {
    it("should allow setting a normal spell when conditions are met", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "Main1",
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

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.canExecute).toBe(true);
    });

    it("should allow setting a field spell even if fieldZone is occupied", () => {
      // Arrange
      const fieldSpell1 = createFieldSpellCard("field-1");
      const fieldSpell2 = { ...createFieldSpellCard("field-2"), location: "fieldZone" as const };
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
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
      expect(result.canExecute).toBe(true);
    });

    it("should fail if not in Main1 phase", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "Draw",
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

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.canExecute).toBe(false);
    });

    it("should fail if spellTrapZone is full (5 cards)", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const existingSpells = Array.from({ length: 5 }, (_, i) => createNormalSpellCard(`existing-${i}`));
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
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
      expect(result.canExecute).toBe(false);
    });

    it("should fail if card not found", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
      });

      const command = new SetSpellTrapCommand("non-existent-id");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.canExecute).toBe(false);
    });

    it("should fail if card is not in hand", () => {
      // Arrange
      const spellCard = { ...createNormalSpellCard("spell-1"), location: "deck" as const };
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [spellCard],
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
      expect(result.canExecute).toBe(false);
    });

    it("should fail if card is not a spell or trap", () => {
      // Arrange
      const monsterCard: CardInstance = {
        instanceId: "monster-1",
        id: 33396948,
        name: "Exodia the Forbidden One",
        type: "monster" as const,
        subtype: "Effect",
        location: "hand" as const,
        position: undefined,
        battlePosition: undefined,
        placedThisTurn: false,
        attack: 1000,
        defense: 1000,
      };
      const state = createMockGameState({
        phase: "Main1",
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

      const command = new SetSpellTrapCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.canExecute).toBe(false);
    });

    it("should fail if game is already over", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [spellCard],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
        result: { isGameOver: true, winner: "player", reason: "Exodia" },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.canExecute).toBe(false);
    });
  });

  describe("execute", () => {
    it("should successfully set normal spell to spellTrapZone face-down", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "Main1",
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

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.hand.length).toBe(0);
      expect(result.updatedState.zones.spellTrapZone.length).toBe(1);

      const setCard = result.updatedState.zones.spellTrapZone[0];
      expect(setCard.instanceId).toBe("spell-1");
      expect(setCard.location).toBe("spellTrapZone");
      expect(setCard.position).toBe("faceDown");
      expect(setCard.placedThisTurn).toBe(true);
    });

    it("should successfully set quick-play spell to spellTrapZone face-down", () => {
      // Arrange
      const spellCard = createQuickPlaySpellCard("quick-1");
      const state = createMockGameState({
        phase: "Main1",
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

      const command = new SetSpellTrapCommand("quick-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.spellTrapZone.length).toBe(1);

      const setCard = result.updatedState.zones.spellTrapZone[0];
      expect(setCard.instanceId).toBe("quick-1");
      expect(setCard.position).toBe("faceDown");
      expect(setCard.placedThisTurn).toBe(true);
    });

    it("should successfully set continuous spell to spellTrapZone face-down", () => {
      // Arrange
      const spellCard = createContinuousSpellCard("continuous-1");
      const state = createMockGameState({
        phase: "Main1",
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

      const command = new SetSpellTrapCommand("continuous-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.zones.spellTrapZone.length).toBe(1);

      const setCard = result.updatedState.zones.spellTrapZone[0];
      expect(setCard.instanceId).toBe("continuous-1");
      expect(setCard.position).toBe("faceDown");
    });

    it("should successfully set field spell to fieldZone face-down", () => {
      // Arrange
      const fieldSpell = createFieldSpellCard("field-1");
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
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
      expect(result.updatedState.zones.hand.length).toBe(0);
      expect(result.updatedState.zones.fieldZone.length).toBe(1);

      const setCard = result.updatedState.zones.fieldZone[0];
      expect(setCard.instanceId).toBe("field-1");
      expect(setCard.location).toBe("fieldZone");
      expect(setCard.position).toBe("faceDown");
      expect(setCard.placedThisTurn).toBe(true);
    });

    it("should replace existing field spell when setting a new field spell", () => {
      // Arrange
      const oldFieldSpell = {
        ...createFieldSpellCard("field-old"),
        location: "fieldZone" as const,
        position: "faceUp" as const,
        placedThisTurn: false,
      };
      const newFieldSpell = createFieldSpellCard("field-new");
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
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
      expect(result.updatedState.zones.fieldZone.length).toBe(1);
      expect(result.updatedState.zones.fieldZone[0].instanceId).toBe("field-new");
      expect(result.updatedState.zones.graveyard.length).toBe(1);
      expect(result.updatedState.zones.graveyard[0].instanceId).toBe("field-old");
    });

    it("should NOT consume normalSummonUsed when setting spell", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "Main1",
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

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.normalSummonUsed).toBe(0); // Should NOT increment
    });

    it("should fail if not in Main1 phase", () => {
      // Arrange
      const spellCard = createNormalSpellCard("spell-1");
      const state = createMockGameState({
        phase: "Draw",
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
        phase: "Main1",
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
      const spellCard = { ...createNormalSpellCard("spell-1"), location: "deck" as const };
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [spellCard],
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
        phase: "Main1",
        zones: {
          deck: [],
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
        phase: "Main1",
        zones: {
          deck: [existingDeckCard],
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
      expect(result.updatedState.zones.deck).toEqual([existingDeckCard]);
      expect(result.updatedState.zones.graveyard).toEqual([existingGraveyardCard]);
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
