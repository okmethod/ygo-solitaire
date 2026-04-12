/**
 * GameSnapshot の整合性チェック関数のテスト
 */

import { describe, it, expect } from "vitest";
import { assertValidGameState } from "$lib/domain/models/GameState/GameStateConsistency";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import {
  createMockGameState,
  createFilledMainDeck,
  createFilledExtraDeck,
  createFilledMonsterZone,
  createFilledFieldZone,
  createMonsterInstance,
} from "../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

/** 有効なゲーム状態を生成 */
const createValidGameState = (): GameSnapshot =>
  createMockGameState({
    space: { ...createFilledMainDeck(30) },
    phase: "main1",
    lp: { player: 8000, opponent: 8000 },
    turn: 1,
  });

// =============================================================================
// assertValidGameState テスト
// =============================================================================

describe("assertValidGameState", () => {
  it("有効な状態ではエラーをスローしない", () => {
    const state = createValidGameState();

    expect(() => assertValidGameState(state)).not.toThrow();
  });

  it("無効な状態ではエラーをスローする", () => {
    const state = createMockGameState({
      phase: "invalid" as "main1",
    });

    expect(() => assertValidGameState(state)).toThrow("Invalid GameState");
  });

  describe("validateSpace", () => {
    it("デッキ枚数が範囲外の場合はエラー", () => {
      const state = createMockGameState({
        space: { ...createFilledMainDeck(61) },
      });

      expect(() => assertValidGameState(state)).toThrow("Deck size is out of bounds");
    });

    it("EXデッキ枚数が範囲外の場合はエラー", () => {
      const state = createMockGameState({
        space: {
          ...createFilledMainDeck(10),
          ...createFilledExtraDeck(16),
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Extra Deck size is out of bounds");
    });

    it("モンスターゾーン枚数が範囲外の場合はエラー", () => {
      const state = createMockGameState({
        space: {
          ...createFilledMainDeck(10),
          ...createFilledMonsterZone(6),
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Main Monster Zone size is out of bounds");
    });

    it("フィールドゾーン枚数が範囲外の場合はエラー", () => {
      const state = createMockGameState({
        space: {
          ...createFilledMainDeck(10),
          ...createFilledFieldZone(2),
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Field Zone size is out of bounds");
    });

    it("重複したインスタンスIDがある場合はエラー", () => {
      const card1 = createMonsterInstance("duplicate-id", { location: "hand" });
      const card2 = createMonsterInstance("duplicate-id", { location: "graveyard" });

      const state = createMockGameState({
        space: {
          ...createFilledMainDeck(10),
          hand: [card1],
          graveyard: [card2],
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Duplicate card instance IDs found");
    });

    it("インスタンスIDが欠落している場合はエラー", () => {
      const invalidCard = {
        ...createMonsterInstance("test", { location: "hand" }),
        instanceId: "",
      };

      const state = createMockGameState({
        space: {
          ...createFilledMainDeck(10),
          hand: [invalidCard],
        },
      });

      expect(() => assertValidGameState(state)).toThrow("card instances with missing IDs");
    });

    it("locationプロパティが不正な場合はエラー", () => {
      const invalidCard = {
        ...createMonsterInstance("test", { location: "hand" }),
        location: "graveyard" as "hand", // 手札にあるのにlocationがgraveyard
      };

      const state = createMockGameState({
        space: {
          ...createFilledMainDeck(10),
          hand: [invalidCard],
        },
      });

      expect(() => assertValidGameState(state)).toThrow("have incorrect location property");
    });
  });

  describe("validateLifePoints", () => {
    it("ライフポイントが負の場合はエラー", () => {
      const state = createMockGameState({
        lp: { player: -100, opponent: 8000 },
      });

      expect(() => assertValidGameState(state)).toThrow("Player LP is out of bounds");
    });

    it("ライフポイントが上限を超える場合はエラー", () => {
      const state = createMockGameState({
        lp: { player: 100000, opponent: 8000 },
      });

      expect(() => assertValidGameState(state)).toThrow("Player LP is out of bounds");
    });

    it("ライフポイントが整数でない場合はエラー", () => {
      const state = createMockGameState({
        lp: { player: 8000.5, opponent: 8000 },
      });

      expect(() => assertValidGameState(state)).toThrow("Player LP must be an integer");
    });
  });

  describe("validatePhase", () => {
    it("無効なフェーズの場合はエラー", () => {
      const state = createMockGameState({
        phase: "invalid" as "main1",
      });

      expect(() => assertValidGameState(state)).toThrow("Invalid phase");
    });
  });

  describe("validateTurn", () => {
    it("ターン数が0以下の場合はエラー", () => {
      const state = createMockGameState({
        turn: 0,
      });

      expect(() => assertValidGameState(state)).toThrow("Turn is out of bounds");
    });

    it("ターン数が上限を超える場合はエラー", () => {
      const state = createMockGameState({
        turn: 1000,
      });

      expect(() => assertValidGameState(state)).toThrow("Turn is out of bounds");
    });
  });

  describe("validateResult", () => {
    it("ゲーム終了時に勝者が未設定の場合はエラー", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          winner: undefined,
          reason: "exodia",
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Game is over but winner is not set");
    });

    it("ゲーム終了時に理由が未設定の場合はエラー", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          winner: "player",
          reason: undefined,
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Game is over but reason is not set");
    });

    it("ゲーム終了時に無効な勝者の場合はエラー", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          winner: "invalid" as "player",
          reason: "exodia",
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Invalid winner");
    });

    it("ゲーム終了時に無効な理由の場合はエラー", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          winner: "player",
          reason: "invalid" as "exodia",
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Invalid reason");
    });

    it("ゲーム進行中に勝者が設定されている場合はエラー", () => {
      const state = createMockGameState({
        result: {
          isGameOver: false,
          winner: "player",
          reason: undefined,
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Game is ongoing but winner is set");
    });

    it("ゲーム進行中に理由が設定されている場合はエラー", () => {
      const state = createMockGameState({
        result: {
          isGameOver: false,
          winner: undefined,
          reason: "exodia",
        },
      });

      expect(() => assertValidGameState(state)).toThrow("Game is ongoing but reason is set");
    });

    it("有効なゲーム終了状態ではエラーなし", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          winner: "player",
          reason: "exodia",
        },
      });

      expect(() => assertValidGameState(state)).not.toThrow();
    });

    it("有効なゲーム進行中状態ではエラーなし", () => {
      const state = createMockGameState({
        result: {
          isGameOver: false,
          winner: undefined,
          reason: undefined,
        },
      });

      expect(() => assertValidGameState(state)).not.toThrow();
    });
  });
});
