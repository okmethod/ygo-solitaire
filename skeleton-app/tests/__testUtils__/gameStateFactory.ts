/**
 * テスト用ゲーム状態ファクトリ
 *
 * GameSnapshot を生成するユーティリティ関数群
 *
 * - createTestInitialDeck: カードID配列から InitialDeckCardIds を生成
 * - createMockGameState: 基本のゲーム状態（部分的な上書き可能）
 * - createStateWithMonsterZone: モンスターゾーンにカードを配置した状態
 * - createStateWithFieldZone: フィールドゾーンにカードを配置した状態
 * - createExodiaVictoryState: エクゾディア勝利状態
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot, CardSpace, InitialDeckCardIds } from "$lib/domain/models/GameState";
import { INITIAL_LP } from "$lib/domain/models/GameState/GameSnapshot";
import { EXODIA_PIECE_IDS } from "./constants";
import { createFilledMainDeck, createHand } from "./cardSpaceFactory";

/**
 * カードID配列を InitialDeckCardIds に変換
 *
 * GameState.initialize() を使うテストで使用する。
 *
 * @param mainDeckCardIds - メインデッキのカードID配列
 */
export function createTestInitialDeck(mainDeckCardIds: number[]): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds: [] };
}

/** createMockGameState の引数型（space を部分的に上書き可能） */
type GameStateOverrides = Omit<Partial<GameSnapshot>, "space"> & {
  space?: Partial<CardSpace>;
};

/**
 * テスト用の最小限のゲーム状態を作成
 *
 * @param overrides - デフォルト値を上書きする部分的な GameSnapshot
 */
export function createMockGameState(overrides?: GameStateOverrides): GameSnapshot {
  const defaultState: GameSnapshot = {
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
    lp: {
      player: INITIAL_LP,
      opponent: INITIAL_LP,
    },
    phase: "main1",
    turn: 1,
    result: {
      isGameOver: false,
    },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    queuedEndPhaseEffectIds: [],
    activatedCardIds: [],
    activationContexts: {},
  };

  return {
    ...defaultState,
    ...overrides,
    space: {
      ...defaultState.space,
      ...overrides?.space,
    },
    lp: {
      ...defaultState.lp,
      ...overrides?.lp,
    },
    result: {
      ...defaultState.result,
      ...overrides?.result,
    },
  };
}

/**
 * モンスターゾーンにカードを配置した状態を生成
 *
 * @param cards - モンスターゾーンに配置するカード配列
 */
export function createStateWithMonsterZone(cards: CardInstance[]): GameSnapshot {
  return createMockGameState({ space: { mainMonsterZone: cards } });
}

/**
 * フィールドゾーンにカードを配置した状態を生成
 *
 * @param cards - フィールドゾーンに配置するカード配列
 */
export function createStateWithFieldZone(cards: CardInstance[]): GameSnapshot {
  return createMockGameState({ space: { fieldZone: cards } });
}

/**
 * エクゾディア全パーツが手札にある勝利状態を作成
 */
export function createExodiaVictoryState(): GameSnapshot {
  return createMockGameState({
    space: {
      ...createFilledMainDeck(35),
      ...createHand([...EXODIA_PIECE_IDS.ALL]),
    },
    phase: "main1",
    result: {
      isGameOver: true,
      winner: "player",
      reason: "exodia",
      message: "All 5 Exodia pieces are in your hand. You win!",
    },
  });
}
