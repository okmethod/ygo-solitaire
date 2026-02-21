/**
 * Unit tests for ActivateSpellCommand
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { createMockGameState, createSpellCard, createSetCard } from "../../../__testUtils__/gameStateFactory";
import type { GameSnapshot } from "$lib/domain/models/GameState";

describe("ActivateSpellCommand", () => {
  let initialState: GameSnapshot;
  const spellCardId = "hand-spell-1";

  beforeEach(() => {
    // Create state with spell card in hand during main1 phase
    initialState = createMockGameState({
      phase: "main1",
      space: {
        mainDeck: [createSpellCard("main-0", 1001, "mainDeck"), createSpellCard("mainDeck-1", 1002, "mainDeck")],
        extraDeck: [],
        hand: [createSpellCard(spellCardId, 1001, "hand"), createSpellCard("hand-2", 1003, "hand")],
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      },
    });
  });

  describe("canExecute", () => {
    it("should return true when spell can be activated (main1 phase, card in hand)", () => {
      const command = new ActivateSpellCommand(spellCardId);

      expect(command.canExecute(initialState).isValid).toBe(true);
    });

    it("should return false when card is not in hand", () => {
      const command = new ActivateSpellCommand("non-existent-card");

      expect(command.canExecute(initialState).isValid).toBe(false);
    });

    it("should return false when not in main1 phase", () => {
      const drawPhaseState = createMockGameState({
        phase: "draw",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [createSpellCard(spellCardId, 1001, "hand")],
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
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [createSpellCard(spellCardId, 1001, "hand")],
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
      expect(result.updatedState.space.hand.length).toBe(1);
      expect(result.updatedState.space.hand.some((c) => c.instanceId === spellCardId)).toBe(false);

      // Pot of Greed has registered effect in ChainableActionRegistry (new system)
      // Card stays on spellTrapZone (effect will send to graveyard later)
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone.some((c) => c.instanceId === spellCardId)).toBe(true);
      expect(result.updatedState.space.graveyard.length).toBe(0);

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

    it("should fail when not in main1 phase", () => {
      const drawPhaseState = createMockGameState({
        phase: "draw",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [createSpellCard(spellCardId, 1005, "hand")],
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
      expect(result.updatedState.space.mainDeck).toEqual(initialState.space.mainDeck);
      expect(result.updatedState.space.banished).toEqual(initialState.space.banished);

      // Only hand and spellTrapZone should change (Pot of Greed has effect, so stays on spellTrapZone)
      expect(result.updatedState.space.hand.length).toBe(initialState.space.hand.length - 1);
      expect(result.updatedState.space.spellTrapZone.length).toBe(initialState.space.spellTrapZone.length + 1);
      expect(result.updatedState.space.graveyard.length).toBe(initialState.space.graveyard.length);
    });

    it("should maintain immutability (original state unchanged)", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const originalHandLength = initialState.space.hand.length;
      const originalGraveyardLength = initialState.space.graveyard.length;

      command.execute(initialState);

      // Original state should remain unchanged
      expect(initialState.space.hand.length).toBe(originalHandLength);
      expect(initialState.space.graveyard.length).toBe(originalGraveyardLength);
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
      // Arrange: Field spell in hand (dummy field spell)
      const fieldSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [createSpellCard("field-spell-1", 1006, "hand")],
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
      expect(result.updatedState.space.fieldZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone.length).toBe(0);
      expect(result.updatedState.space.fieldZone[0].id).toBe(1006);
    });

    it("should place normal spell in spellTrapZone", () => {
      // Arrange: Normal spell in hand
      const normalSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [createSpellCard("main-0", 1001, "mainDeck"), createSpellCard("main-1", 1002, "mainDeck")],
          extraDeck: [],
          hand: [createSpellCard("normal-spell-1", 1001, "hand")],
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
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.fieldZone.length).toBe(0);
      expect(result.updatedState.space.spellTrapZone[0].id).toBe(1001);
    });

    it("should place continuous spell in spellTrapZone and keep it on field", () => {
      // Arrange: Continuous spell in hand (NoOp registered)
      const continuousSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [createSpellCard("continuous-spell-1", 1005, "hand")],
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
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.graveyard.length).toBe(0);
      expect(result.updatedState.space.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
    });
  });

  describe("Set Card Activation", () => {
    it("should allow activating normal spell from spellTrapZone", () => {
      // Arrange: Normal spell set in spellTrapZone
      const setSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [createSpellCard("main-0", 1001, "mainDeck"), createSpellCard("mainDeck-1", 1002, "mainDeck")],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [createSetCard("set-spell-1", 1001, "spellTrapZone")],
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
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
    });

    it("should allow activating field spell from fieldZone", () => {
      // Arrange: Field spell set in fieldZone (dummy field spell)
      const setFieldSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [createSetCard("set-field-spell-1", 1006, "fieldZone")],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("set-field-spell-1");
      const result = command.execute(setFieldSpellState);

      // Assert: Field spell should be flipped face-up and stay in fieldZone
      expect(result.success).toBe(true);
      expect(result.updatedState.space.fieldZone.length).toBe(1);
      expect(result.updatedState.space.fieldZone[0].stateOnField?.position).toBe("faceUp");
      expect(result.updatedState.space.fieldZone[0].instanceId).toBe("set-field-spell-1");
      expect(result.effectSteps).toBeDefined();
    });

    it("should reject activating quick-play spell set this turn", () => {
      // Arrange: Quick-play spell set this turn
      const setQuickPlayState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [createSetCard("set-quick-play-1", 1004, "spellTrapZone", { placedThisTurn: true })],
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
      // Arrange: Quick-play spell set previous turn
      const setQuickPlayState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [createSetCard("set-quick-play-2", 1004, "spellTrapZone")], // placedThisTurn: false by default
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("set-quick-play-2");
      const result = command.execute(setQuickPlayState);

      // Assert: セットしたターンでなければ発動可能
      expect(result.success).toBe(true);
      // Game state: card moved to face-up position
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
    });
  });
});
