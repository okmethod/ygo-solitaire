/**
 * VictoryCondition Tests
 *
 * 勝敗判定のテスト。
 * エクゾディア勝利、LP0による勝敗、ゲーム続行を検証する。
 *
 * @module tests/unit/domain/models/VictoryCondition
 */

import { describe, it, expect } from "vitest";
import { GameState } from "$lib/domain/models/GameState";
import { createMockGameState, createCardInstances } from "../../../__testUtils__/gameStateFactory";

// エクゾディアパーツのカードID
const EXODIA_PIECE_IDS = {
  MAIN: 33396948, // 封印されしエクゾディア（本体）
  RIGHT_ARM: 70903634, // 封印されし者の右腕
  LEFT_ARM: 7902349, // 封印されし者の左腕
  RIGHT_LEG: 8124921, // 封印されし者の右足
  LEFT_LEG: 44519536, // 封印されし者の左足
};

describe("VictoryCondition", () => {
  describe("Exodia Victory", () => {
    it("should declare player victory when all 5 Exodia pieces are in hand", () => {
      // Arrange
      const exodiaHand = createCardInstances(
        [
          EXODIA_PIECE_IDS.MAIN,
          EXODIA_PIECE_IDS.RIGHT_ARM,
          EXODIA_PIECE_IDS.LEFT_ARM,
          EXODIA_PIECE_IDS.RIGHT_LEG,
          EXODIA_PIECE_IDS.LEFT_LEG,
        ],
        "hand",
      );
      const state = createMockGameState({
        space: {
          hand: exodiaHand,
          mainDeck: createCardInstances(Array(35).fill(12345678), "mainDeck"),
        },
      });

      // Act
      const checkedState = GameState.checkVictory(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("player");
      expect(checkedState.result.reason).toBe("exodia");
      expect(checkedState.result.message).toContain("エクゾディア");
    });

    it("should not declare victory when only 4 Exodia pieces are in hand", () => {
      // Arrange: Missing left leg
      const partialExodiaHand = createCardInstances(
        [EXODIA_PIECE_IDS.MAIN, EXODIA_PIECE_IDS.RIGHT_ARM, EXODIA_PIECE_IDS.LEFT_ARM, EXODIA_PIECE_IDS.RIGHT_LEG],
        "hand",
      );
      const state = createMockGameState({
        space: {
          hand: partialExodiaHand,
          mainDeck: createCardInstances(Array(36).fill(12345678), "mainDeck"),
        },
      });

      // Act
      const checkedState = GameState.checkVictory(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(false);
    });

    it("should not declare victory when Exodia pieces are in different zones", () => {
      // Arrange: Some pieces on field, some in hand
      const handCards = createCardInstances(
        [EXODIA_PIECE_IDS.MAIN, EXODIA_PIECE_IDS.RIGHT_ARM, EXODIA_PIECE_IDS.LEFT_ARM],
        "hand",
      );
      const graveyardCards = createCardInstances([EXODIA_PIECE_IDS.RIGHT_LEG, EXODIA_PIECE_IDS.LEFT_LEG], "graveyard");
      const state = createMockGameState({
        space: {
          hand: handCards,
          graveyard: graveyardCards,
          mainDeck: createCardInstances(Array(35).fill(12345678), "mainDeck"),
        },
      });

      // Act
      const checkedState = GameState.checkVictory(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(false);
    });
  });

  describe("LP0 Victory/Defeat", () => {
    it("should declare opponent victory when player LP is 0", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: 0, opponent: 8000 },
      });

      // Act
      const checkedState = GameState.checkVictory(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("opponent");
      expect(checkedState.result.reason).toBe("lp0");
      expect(checkedState.result.message).toContain("敗北");
    });

    it("should declare player victory when opponent LP is 0", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: 8000, opponent: 0 },
      });

      // Act
      const checkedState = GameState.checkVictory(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("player");
      expect(checkedState.result.reason).toBe("lp0");
      expect(checkedState.result.message).toContain("勝利");
    });

    it("should declare opponent victory when player LP is negative", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: -1000, opponent: 8000 },
      });

      // Act
      const checkedState = GameState.checkVictory(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("opponent");
      expect(checkedState.result.reason).toBe("lp0");
    });
  });

  describe("Game In Progress", () => {
    it("should not declare game over when both players have LP and no special conditions", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
      });

      // Act
      const checkedState = GameState.checkVictory(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(false);
      expect(checkedState.result.winner).toBeUndefined();
      expect(checkedState.result.reason).toBeUndefined();
    });

    it("should not re-check victory if already game over", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
        result: {
          isGameOver: true,
          winner: "player",
          reason: "exodia",
          message: "Already won",
        },
      });

      // Act
      const checkedState = GameState.checkVictory(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.reason).toBe("exodia");
      expect(checkedState.result.message).toBe("Already won");
    });
  });

  describe("Victory Priority", () => {
    it("should prioritize Exodia over LP0 when both conditions are met", () => {
      // Arrange: Player has 0 LP but also has all Exodia pieces
      const exodiaHand = createCardInstances(
        [
          EXODIA_PIECE_IDS.MAIN,
          EXODIA_PIECE_IDS.RIGHT_ARM,
          EXODIA_PIECE_IDS.LEFT_ARM,
          EXODIA_PIECE_IDS.RIGHT_LEG,
          EXODIA_PIECE_IDS.LEFT_LEG,
        ],
        "hand",
      );
      const state = createMockGameState({
        lp: { player: 0, opponent: 8000 },
        space: {
          hand: exodiaHand,
          mainDeck: createCardInstances(Array(35).fill(12345678), "mainDeck"),
        },
      });

      // Act
      const checkedState = GameState.checkVictory(state);

      // Assert: Exodia should take priority
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("player");
      expect(checkedState.result.reason).toBe("exodia");
    });
  });
});
