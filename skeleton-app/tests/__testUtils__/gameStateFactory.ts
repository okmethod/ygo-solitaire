/**
 * テスト用ゲーム状態ファクトリ
 *
 * テストシナリオで使用する GameSnapshot を生成するユーティリティ
 *
 * - createMockGameState: 基本のゲーム状態（部分的な上書き可能）
 * - createExodiaDeckState: エクゾディアデッキの初期状態
 * - createStateWithHand: 手札を指定したゲーム状態
 * - createStateWithSpellOnField: フィールドに魔法カードを配置した状態
 * - createStateWithGraveyard: 墓地を指定したゲーム状態
 * - createExodiaVictoryState: エクゾディア勝利状態
 * - createLPZeroState: LP0敗北状態
 * - createDeckOutState: デッキ切れ敗北状態
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot, GamePhase, CardSpace } from "$lib/domain/models/GameState";
import { INITIAL_LP } from "$lib/domain/models/GameState/GameSnapshot";
import { EXODIA_PIECE_IDS, TEST_CARD_IDS } from "./constants";
import { createCardInstances } from "./cardInstanceFactory";

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
    activatedCardIds: new Set<number>(),
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
 * エクゾディアデッキ（40枚）の初期状態を作成
 */
export function createExodiaDeckState(): GameSnapshot {
  const exodiaDeck = [
    ...EXODIA_PIECE_IDS.ALL, // 5 Exodia pieces
    19613556, // Pot of Greed (x3)
    19613556,
    19613556,
    79571449, // Graceful Charity (x3)
    79571449,
    79571449,
    32807846, // Reinforcement of the Army (x3)
    32807846,
    32807846,
    73915051, // Swords of Revealing Light (x3)
    73915051,
    73915051,
    45986603, // Backup Soldier (x3)
    45986603,
    45986603,
    // Fill remaining slots with dummy cards to reach 40
    ...Array(40 - 5 - 15).fill(TEST_CARD_IDS.DUMMY),
  ];

  return createMockGameState({
    space: {
      mainDeck: createCardInstances(exodiaDeck, "mainDeck"),
    },
    phase: "draw",
    turn: 1,
  });
}

/**
 * 指定カードを手札に持つゲーム状態を作成
 *
 * @param cardIds - 手札に配置するカードIDの配列
 * @param phase - 現在のフェイズ（デフォルト: "main1"）
 */
export function createStateWithHand(cardIds: (string | number)[], phase: GamePhase = "main1"): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      hand: createCardInstances(cardIds, "hand"),
    },
    phase,
  });
}

/**
 * 魔法・罠ゾーンにカードを配置したゲーム状態を作成
 *
 * @param spellCardId - 配置する魔法カードのID
 */
export function createStateWithSpellOnField(spellCardId: string | number): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(35).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      spellTrapZone: createCardInstances([spellCardId], "spellTrapZone"),
    },
    phase: "main1",
  });
}

/**
 * 墓地にカードを配置したゲーム状態を作成
 *
 * @param cardIds - 墓地に配置するカードIDの配列
 */
export function createStateWithGraveyard(cardIds: (string | number)[]): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      graveyard: createCardInstances(cardIds, "graveyard"),
    },
  });
}

/**
 * エクゾディア全パーツが手札にある勝利状態を作成
 */
export function createExodiaVictoryState(): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(35).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      hand: createCardInstances([...EXODIA_PIECE_IDS.ALL], "hand"),
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

/**
 * LP0（敗北）状態を作成
 */
export function createLPZeroState(): GameSnapshot {
  return createMockGameState({
    lp: {
      player: 0,
      opponent: INITIAL_LP,
    },
    phase: "main1",
    result: {
      isGameOver: true,
      winner: "opponent",
      reason: "lp0",
      message: "Your Life Points reached 0. You lose!",
    },
  });
}

/**
 * デッキ切れ（敗北）状態を作成
 */
export function createDeckOutState(): GameSnapshot {
  return createMockGameState({
    space: {
      hand: createCardInstances([TEST_CARD_IDS.DUMMY], "hand"),
      graveyard: createCardInstances(Array(39).fill(TEST_CARD_IDS.DUMMY), "graveyard"),
    },
    phase: "draw",
    result: {
      isGameOver: true,
      winner: "opponent",
      reason: "deckout",
      message: "You cannot draw from an empty deck. You lose!",
    },
  });
}
