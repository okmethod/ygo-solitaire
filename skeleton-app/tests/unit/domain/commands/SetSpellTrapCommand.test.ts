/**
 * Unit tests for SetSpellTrapCommand
 *
 * Tests the SetSpellTrapCommand which sets a spell or trap card face-down
 * to either the spellTrapZone or fieldZone (for field spells).
 * Setting does NOT consume normal summon rights.
 */

import { describe, it, expect } from "vitest";
import { SetSpellTrapCommand } from "$lib/domain/commands/SetSpellTrapCommand";
import {
  createMockGameState,
  createSpellInstance,
  createMonsterInstance,
  createFilledSpellZone,
  createExodiaVictoryState,
} from "../../../__testUtils__";

describe("SetSpellTrapCommand", () => {
  describe("canExecute", () => {
    it("should allow setting a normal spell when conditions are met", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const state = createMockGameState({
        space: { hand: [spellCard] },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should allow setting a field spell even if fieldZone is occupied", () => {
      // Arrange
      const fieldSpell1 = createSpellInstance("field-1", { spellType: "field" });
      const fieldSpell2 = createSpellInstance("field-2", { spellType: "field", location: "fieldZone" });
      const state = createMockGameState({
        space: {
          hand: [fieldSpell1],
          fieldZone: [fieldSpell2],
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
      const spellCard = createSpellInstance("spell-1");
      const state = createMockGameState({
        phase: "draw",
        space: { hand: [spellCard] },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if spellTrapZone is full (5 cards)", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const state = createMockGameState({
        space: {
          hand: [spellCard],
          ...createFilledSpellZone(5),
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
      const state = createMockGameState();

      const command = new SetSpellTrapCommand("non-existent-id");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if card is not in hand", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1", { spellType: "normal", location: "mainDeck" });
      const state = createMockGameState({
        space: { mainDeck: [spellCard] },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if card is not a spell or trap", () => {
      // Arrange
      const monsterCard = createMonsterInstance("monster-1");
      const state = createMockGameState({
        space: { hand: [monsterCard] },
      });

      const command = new SetSpellTrapCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("should fail if game is already over", () => {
      // Arrange
      const state = createExodiaVictoryState();

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
      const spellCard = createSpellInstance("spell-1");
      const state = createMockGameState({
        space: { hand: [spellCard] },
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
      const spellCard = createSpellInstance("quick-1", { spellType: "quick-play" });
      const state = createMockGameState({
        space: { hand: [spellCard] },
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
      const spellCard = createSpellInstance("continuous-1", { spellType: "continuous" });
      const state = createMockGameState({
        space: { hand: [spellCard] },
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
      const fieldSpell = createSpellInstance("field-1", { spellType: "field" });
      const state = createMockGameState({
        space: { hand: [fieldSpell] },
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
        ...createSpellInstance("field-old", { spellType: "field" }),
        location: "fieldZone" as const,
        stateOnField: {
          slotIndex: 0,
          position: "faceUp" as const,
          counters: [],
          activatedEffects: new Set<string>(),
          placedThisTurn: false,
        },
      };
      const newFieldSpell = createSpellInstance("field-new", { spellType: "field" });
      const state = createMockGameState({
        space: {
          hand: [newFieldSpell],
          fieldZone: [oldFieldSpell],
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
      const spellCard = createSpellInstance("spell-1");
      const state = createMockGameState({
        normalSummonUsed: 0,
        space: { hand: [spellCard] },
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
      const spellCard = createSpellInstance("spell-1");
      const state = createMockGameState({
        phase: "draw",
        space: { hand: [spellCard] },
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
      const state = createMockGameState();

      const command = new SetSpellTrapCommand("non-existent-id");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");
    });

    it("should fail if card is not in hand", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1", { spellType: "normal", location: "mainDeck" });
      const state = createMockGameState({
        space: { mainDeck: [spellCard] },
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
      const spellCard = createSpellInstance("spell-1");
      const existingSpells = createFilledSpellZone(5).spellTrapZone.map((s) => ({
        ...s,
        location: "spellTrapZone" as const,
      }));
      const state = createMockGameState({
        space: {
          hand: [spellCard],
          spellTrapZone: existingSpells,
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
      const spellCard = createSpellInstance("spell-1");
      const existingDeckCard = createSpellInstance("deck-card", { spellType: "normal", location: "mainDeck" });
      const existingGraveyardCard = createSpellInstance("gy-card", { spellType: "normal", location: "graveyard" });

      const state = createMockGameState({
        space: {
          mainDeck: [existingDeckCard],
          hand: [spellCard],
          graveyard: [existingGraveyardCard],
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
