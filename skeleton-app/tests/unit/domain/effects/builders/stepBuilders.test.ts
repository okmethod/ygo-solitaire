/**
 * stepBuilders Tests
 *
 * Tests for step builder helper functions.
 *
 * Test Coverage:
 * - createDrawStep()
 * - createSendToGraveyardStep()
 * - createCardSelectionStep()
 * - createGainLifeStep()
 * - createDamageStep()
 * - createShuffleStep()
 * - createReturnToDeckStep()
 *
 * @module tests/unit/domain/effects/builders/stepBuilders
 */

import { describe, it, expect } from "vitest";
import {
  createDrawStep,
  createSendToGraveyardStep,
  createCardSelectionStep,
  createGainLifeStep,
  createDamageStep,
  createShuffleStep,
  createReturnToDeckStep,
} from "$lib/domain/effects/builders/stepBuilders";
import { createInitialGameState, type InitialDeckCardIds } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";

/** テスト用ヘルパー: カードID配列をInitialDeckCardIdsに変換 */
function createTestInitialDeck(mainDeckCardIds: number[]): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds: [] };
}

describe("stepBuilders", () => {
  describe("createDrawStep()", () => {
    it("should create a draw step with default values", () => {
      // Arrange & Act
      const step = createDrawStep(2);

      // Assert
      expect(step.id).toBe("draw-2");
      expect(step.summary).toBe("カードをドロー");
      expect(step.description).toBe("デッキから2枚ドローします");
      expect(step.notificationLevel).toBe("info");
    });

    it("should create a draw step with custom options", () => {
      // Arrange & Act
      const step = createDrawStep(1, {
        id: "custom-draw",
        summary: "カスタムドロー",
        description: "カスタム説明",
      });

      // Assert
      expect(step.id).toBe("custom-draw");
      expect(step.summary).toBe("カスタムドロー");
      expect(step.description).toBe("カスタム説明");
    });

    it("should successfully draw cards when deck has enough cards", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003, 1001]));
      const step = createDrawStep(2);

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.zones.hand.length).toBe(state.zones.hand.length + 2);
      expect(result.newState.zones.deck.length).toBe(state.zones.deck.length - 2);
      expect(result.message).toBe("Drew 2 cards");
    });

    it("should fail when deck does not have enough cards", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001]));
      const step = createDrawStep(2);

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot draw 2 cards. Not enough cards in deck.");
    });

    it("should use singular form for 1 card", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002]));
      const step = createDrawStep(1);

      // Act
      const result = step.action(state);

      // Assert
      expect(result.message).toBe("Drew 1 card");
    });
  });

  describe("createSendToGraveyardStep()", () => {
    it("should create a graveyard step with default values", () => {
      // Arrange & Act
      const step = createSendToGraveyardStep("pot-of-greed-1", 55144522); // Pot of Greed

      // Assert
      expect(step.id).toBe("pot-of-greed-1-graveyard");
      expect(step.summary).toBe("墓地へ送る");
      expect(step.description).toBe("強欲な壺を墓地に送ります"); // Uses card data from registry
      expect(step.notificationLevel).toBe("info");
    });

    it("should create a graveyard step with custom id", () => {
      // Arrange & Act
      const step = createSendToGraveyardStep("pot-of-greed-1", 55144522, {
        id: "custom-graveyard",
      });

      // Assert
      expect(step.id).toBe("custom-graveyard");
    });

    it("should successfully send card to graveyard from spellTrapZone", () => {
      // Arrange
      const baseState = createInitialGameState(createTestInitialDeck([1001, 1002]));
      // Add a card to spellTrapZone manually
      const state: GameState = {
        ...baseState,
        zones: {
          ...baseState.zones,
          spellTrapZone: [
            {
              ...baseState.zones.deck[0],
              instanceId: "spellTrap-0",
              location: "spellTrapZone",
              placedThisTurn: false,
            },
          ],
        },
      };
      const cardOnField = state.zones.spellTrapZone[0];
      const step = createSendToGraveyardStep(cardOnField.instanceId, 1001); // Test card ID from registry

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.zones.graveyard.length).toBe(state.zones.graveyard.length + 1);
      expect(result.message).toContain("Test Spell 1 to graveyard"); // Uses jaName from registry
    });
  });

  describe("createCardSelectionStep()", () => {
    it("should create a card selection step", () => {
      // Arrange & Act
      const step = createCardSelectionStep({
        id: "test-select",
        summary: "カード選択",
        description: "カードを選んでください",
        availableCards: [],
        minCards: 1,
        maxCards: 3,
        cancelable: false,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onSelect: (state, _selectedIds) => ({
          success: true,
          newState: state,
          message: "Selected",
        }),
      });

      // Assert
      expect(step.id).toBe("test-select");
      expect(step.summary).toBe("カード選択");
      expect(step.description).toBe("カードを選んでください");
      expect(step.notificationLevel).toBe("interactive");
      expect(step.cardSelectionConfig).toBeDefined();
      expect(step.cardSelectionConfig?.minCards).toBe(1);
      expect(step.cardSelectionConfig?.maxCards).toBe(3);
    });

    it("should call onSelect with selected card IDs", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002]));
      let receivedIds: string[] = [];
      const step = createCardSelectionStep({
        id: "test-select",
        summary: "テスト",
        description: "テスト",
        availableCards: [],
        minCards: 0,
        maxCards: 2,
        onSelect: (s, selectedIds) => {
          receivedIds = selectedIds;
          return { success: true, newState: s, message: "OK" };
        },
      });

      // Act
      step.action(state, ["id1", "id2"]);

      // Assert
      expect(receivedIds).toEqual(["id1", "id2"]);
    });

    it("should handle empty selection when minCards is 0", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002]));
      const step = createCardSelectionStep({
        id: "test-select",
        summary: "テスト",
        description: "テスト",
        availableCards: [],
        minCards: 0,
        maxCards: 5,
        onSelect: (s, selectedIds) => ({
          success: true,
          newState: s,
          message: `Selected ${selectedIds.length}`,
        }),
      });

      // Act
      const result = step.action(state, []);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe("Selected 0");
    });
  });

  describe("createGainLifeStep()", () => {
    it("should create a gain LP step with default target (opponent)", () => {
      // Arrange & Act
      const step = createGainLifeStep(1000);

      // Assert
      expect(step.id).toBe("gain-lp-opponent-1000");
      expect(step.summary).toBe("相手のLPを増加");
      expect(step.description).toBe("相手のLPが1000増加します");
      expect(step.notificationLevel).toBe("info");
    });

    it("should create a gain LP step for player", () => {
      // Arrange & Act
      const step = createGainLifeStep(500, { target: "player" });

      // Assert
      expect(step.id).toBe("gain-lp-player-500");
      expect(step.summary).toBe("プレイヤーのLPを増加");
      expect(step.description).toBe("プレイヤーのLPが500増加します");
    });

    it("should successfully increase opponent LP", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002]));
      const initialOpponentLP = state.lp.opponent;
      const step = createGainLifeStep(1000);

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.lp.opponent).toBe(initialOpponentLP + 1000);
      expect(result.message).toBe("Opponent gained 1000 LP");
    });

    it("should successfully increase player LP", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002]));
      const initialPlayerLP = state.lp.player;
      const step = createGainLifeStep(500, { target: "player" });

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.lp.player).toBe(initialPlayerLP + 500);
      expect(result.message).toBe("Player gained 500 LP");
    });
  });

  describe("createDamageStep()", () => {
    it("should create a damage step with default target (player)", () => {
      // Arrange & Act
      const step = createDamageStep(1000);

      // Assert
      expect(step.id).toBe("damage-player-1000");
      expect(step.summary).toBe("プレイヤーにダメージ");
      expect(step.description).toBe("プレイヤーは1000ダメージを受けます");
      expect(step.notificationLevel).toBe("info");
    });

    it("should create a damage step for opponent", () => {
      // Arrange & Act
      const step = createDamageStep(500, { target: "opponent" });

      // Assert
      expect(step.id).toBe("damage-opponent-500");
      expect(step.summary).toBe("相手にダメージ");
      expect(step.description).toBe("相手は500ダメージを受けます");
    });

    it("should successfully decrease player LP", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002]));
      const initialPlayerLP = state.lp.player;
      const step = createDamageStep(1000);

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.lp.player).toBe(initialPlayerLP - 1000);
      expect(result.message).toBe("Player took 1000 damage");
    });

    it("should successfully decrease opponent LP", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002]));
      const initialOpponentLP = state.lp.opponent;
      const step = createDamageStep(500, { target: "opponent" });

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.lp.opponent).toBe(initialOpponentLP - 500);
      expect(result.message).toBe("Opponent took 500 damage");
    });
  });

  describe("createShuffleStep()", () => {
    it("should create a shuffle step with default values", () => {
      // Arrange & Act
      const step = createShuffleStep();

      // Assert
      expect(step.id).toBe("shuffle-deck");
      expect(step.summary).toBe("デッキシャッフル");
      expect(step.description).toBe("デッキをシャッフルします");
      expect(step.notificationLevel).toBe("info");
    });

    it("should create a shuffle step with custom options", () => {
      // Arrange & Act
      const step = createShuffleStep({
        id: "custom-shuffle",
        summary: "カスタムシャッフル",
        description: "カスタム説明",
      });

      // Assert
      expect(step.id).toBe("custom-shuffle");
      expect(step.summary).toBe("カスタムシャッフル");
      expect(step.description).toBe("カスタム説明");
    });

    it("should successfully shuffle deck", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003, 1001, 1002]));
      const originalDeckSize = state.zones.deck.length;
      const step = createShuffleStep();

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.zones.deck.length).toBe(originalDeckSize);
      expect(result.message).toBe("Deck shuffled");
      // Note: Shuffle randomness is hard to test, just verify deck size unchanged
    });
  });

  describe("createReturnToDeckStep()", () => {
    it("should create a return to deck step with default values", () => {
      // Arrange & Act
      const step = createReturnToDeckStep(["id1", "id2"]);

      // Assert
      expect(step.id).toBe("return-to-deck-2");
      expect(step.summary).toBe("デッキに戻す");
      expect(step.description).toBe("2枚のカードをデッキに戻します");
      expect(step.notificationLevel).toBe("info");
    });

    it("should create a return to deck step with custom options", () => {
      // Arrange & Act
      const step = createReturnToDeckStep(["id1"], {
        id: "custom-return",
        summary: "カスタム戻す",
        description: "カスタム説明",
      });

      // Assert
      expect(step.id).toBe("custom-return");
      expect(step.summary).toBe("カスタム戻す");
      expect(step.description).toBe("カスタム説明");
    });

    it("should successfully return cards to deck from hand", () => {
      // Arrange
      const baseState = createInitialGameState(createTestInitialDeck([1001, 1002]));
      // Add cards to hand manually
      const state: GameState = {
        ...baseState,
        zones: {
          ...baseState.zones,
          hand: [
            {
              ...baseState.zones.deck[0],
              instanceId: "hand-0",
              location: "hand",
            },
            {
              ...baseState.zones.deck[1],
              instanceId: "hand-1",
              location: "hand",
            },
          ],
        },
      };
      const handCards = state.zones.hand;
      const step = createReturnToDeckStep([handCards[0].instanceId]);

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState.zones.hand.length).toBe(state.zones.hand.length - 1);
      expect(result.newState.zones.deck.length).toBe(state.zones.deck.length + 1);
      expect(result.message).toBe("Returned 1 card to deck");
    });

    it("should handle empty instanceIds array", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002]));
      const step = createReturnToDeckStep([]);

      // Act
      const result = step.action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe("No cards to return");
    });

    it("should use plural form for multiple cards", () => {
      // Arrange
      const baseState = createInitialGameState(createTestInitialDeck([1001, 1002]));
      // Add cards to hand manually
      const state: GameState = {
        ...baseState,
        zones: {
          ...baseState.zones,
          hand: [
            {
              ...baseState.zones.deck[0],
              instanceId: "hand-0",
              location: "hand",
            },
            {
              ...baseState.zones.deck[1],
              instanceId: "hand-1",
              location: "hand",
            },
          ],
        },
      };
      const handCards = state.zones.hand;
      const step = createReturnToDeckStep([handCards[0].instanceId, handCards[1].instanceId]);

      // Act
      const result = step.action(state);

      // Assert
      expect(result.message).toBe("Returned 2 cards to deck");
    });
  });
});
