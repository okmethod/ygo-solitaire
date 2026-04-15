/**
 * VictoryCondition Tests
 */

import { describe, it, expect } from "vitest";
import { checkedVictoryState } from "$lib/domain/models/GameState/VictoryCondition";
import {
  createMockGameState,
  createSpaceState,
  createHand,
  createGraveyard,
  ACTUAL_CARD_IDS,
} from "../../../__testUtils__";

const ALL_PARTS: number[] = [
  ACTUAL_CARD_IDS.EXODIA_BODY,
  ACTUAL_CARD_IDS.EXODIA_RIGHT_ARM,
  ACTUAL_CARD_IDS.EXODIA_LEFT_ARM,
  ACTUAL_CARD_IDS.EXODIA_RIGHT_LEG,
  ACTUAL_CARD_IDS.EXODIA_LEFT_LEG,
];

describe("VictoryCondition", () => {
  describe("エクゾディア勝利", () => {
    it("エクゾディア5パーツが手札に揃った場合、プレイヤーの勝利を宣言する", () => {
      // Arrange
      const state = createSpaceState({ ...createHand(ALL_PARTS) });

      // Act
      const checkedState = checkedVictoryState(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("player");
      expect(checkedState.result.reason).toBe("exodia");
      expect(checkedState.result.message).toContain("エクゾディア");
    });

    it("手札にエクゾディアが4パーツしかない場合、勝利を宣言しない", () => {
      // Arrange: 1パーツ不足
      const state = createSpaceState({ ...createHand(ALL_PARTS.slice(0, 4)) });

      // Act
      const checkedState = checkedVictoryState(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(false);
    });

    it("エクゾディアのパーツが異なるゾーンにある場合、勝利を宣言しない", () => {
      // Arrange: 一部のパーツは手札、一部は墓地
      const state = createSpaceState({
        ...createHand(ALL_PARTS.slice(0, 3)),
        ...createGraveyard(ALL_PARTS.slice(3, 5)),
      });

      // Act
      const checkedState = checkedVictoryState(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(false);
    });
  });

  describe("LP0による勝敗", () => {
    it("プレイヤーのLPが0の場合、相手の勝利を宣言する", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: 0, opponent: 8000 },
      });

      // Act
      const checkedState = checkedVictoryState(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("opponent");
      expect(checkedState.result.reason).toBe("lp0");
      expect(checkedState.result.message).toContain("敗北");
    });

    it("相手のLPが0の場合、プレイヤーの勝利を宣言する", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: 8000, opponent: 0 },
      });

      // Act
      const checkedState = checkedVictoryState(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("player");
      expect(checkedState.result.reason).toBe("lp0");
      expect(checkedState.result.message).toContain("勝利");
    });

    it("プレイヤーのLPがマイナスの場合、相手の勝利を宣言する", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: -1000, opponent: 8000 },
      });

      // Act
      const checkedState = checkedVictoryState(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("opponent");
      expect(checkedState.result.reason).toBe("lp0");
    });
  });

  describe("ゲーム続行中", () => {
    it("両プレイヤーにLPがあり特殊条件がない場合、ゲームオーバーを宣言しない", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
      });

      // Act
      const checkedState = checkedVictoryState(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(false);
      expect(checkedState.result.winner).toBeUndefined();
      expect(checkedState.result.reason).toBeUndefined();
    });

    it("既にゲームオーバーの場合、再度勝利チェックを行わない", () => {
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
      const checkedState = checkedVictoryState(state);

      // Assert
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.reason).toBe("exodia");
      expect(checkedState.result.message).toBe("Already won");
    });
  });

  describe("勝利条件の優先度", () => {
    it("エクゾディアとLP0の両条件が満たされた場合、エクゾディアを優先する", () => {
      // Arrange: プレイヤーのLPが0かつエクゾディア5パーツ手札あり
      const state = createMockGameState({
        lp: { player: 0, opponent: 8000 },
        space: {
          ...createHand(ALL_PARTS),
        },
      });

      // Act
      const checkedState = checkedVictoryState(state);

      // Assert: エクゾディアが優先される
      expect(checkedState.result.isGameOver).toBe(true);
      expect(checkedState.result.winner).toBe("player");
      expect(checkedState.result.reason).toBe("exodia");
    });
  });
});
