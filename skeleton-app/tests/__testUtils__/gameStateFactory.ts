/**
 * テスト用ゲーム状態ファクトリ
 *
 * GameSnapshot を生成するユーティリティ関数群
 *
 * - createTestInitialDeck: カードID配列から InitialDeckCardIds を生成
 * - createMockGameState: 基本のゲーム状態（部分的な上書き可能）
 * - createSpaceState: 各ロケーションに CardInstance[] を渡した状態
 * - createFilledSpaceState: 各ロケーションをダミーカード（枚数指定）で埋めた状態
 * - createExodiaVictoryState: エクゾディア勝利状態
 */

import type { GameSnapshot, CardSpace, InitialDeckCardIds } from "$lib/domain/models/GameState";
import { INITIAL_LP } from "$lib/domain/models/GameState/GameSnapshot";
import { ACTUAL_CARD_IDS } from "./constants";
import { createMonsterInstance, createMonsterOnField } from "./cardInstanceFactory";
import {
  createFilledMainDeck,
  createFilledExtraDeck,
  createFilledHand,
  createFilledMonsterZone,
  createFilledSpellZone,
  createFilledFieldZone,
  createFilledGraveyard,
  createFilledBanished,
  createHand,
} from "./cardSpaceFactory";

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
 * 各ロケーションに CardInstance[] を渡したゲーム状態を生成する
 *
 * 省略したロケーションは空（[]）として扱われる。
 * createStateWithMonsterZone / createStateWithFieldZone の汎用版。
 *
 * @param space - 各ロケーションの CardInstance[] を指定するオプション（Partial<CardSpace>）
 */
export function createSpaceState(space: Partial<CardSpace> = {}): GameSnapshot {
  return createMockGameState({ space });
}

/**
 * 各ロケーションを指定した枚数のダミーカードで埋めたゲーム状態を生成する
 *
 * 省略したロケーションは空（0枚）として扱われる。
 * カード種別は各ロケーションのデフォルト（通常モンスター・通常魔法など）が使用される。
 *
 * @param options - 各ロケーションの枚数を指定するオプション
 */
export const createFilledSpaceState = (options: {
  mainDeckCount?: number;
  extraDeckCount?: number;
  handCount?: number;
  monsterZoneCount?: number;
  spellTrapZoneCount?: number;
  fieldZoneCount?: number;
  graveyardCount?: number;
  banishedCount?: number;
}) => {
  return createMockGameState({
    space: {
      ...createFilledMainDeck(options.mainDeckCount ?? 0),
      ...createFilledExtraDeck(options.extraDeckCount ?? 0),
      ...createFilledHand(options.handCount ?? 0),
      ...createFilledMonsterZone(options.monsterZoneCount ?? 0),
      ...createFilledSpellZone(options.spellTrapZoneCount ?? 0),
      ...createFilledFieldZone(options.fieldZoneCount ?? 0),
      ...createFilledGraveyard(options.graveyardCount ?? 0),
      ...createFilledBanished(options.banishedCount ?? 0),
    },
  });
};

/**
 * エクゾディア全パーツが手札にある勝利状態を作成
 */
export function createExodiaVictoryState(): GameSnapshot {
  return createMockGameState({
    space: {
      ...createFilledMainDeck(35),
      ...createHand([
        ACTUAL_CARD_IDS.EXODIA_BODY,
        ACTUAL_CARD_IDS.EXODIA_LEFT_ARM,
        ACTUAL_CARD_IDS.EXODIA_RIGHT_ARM,
        ACTUAL_CARD_IDS.EXODIA_LEFT_LEG,
        ACTUAL_CARD_IDS.EXODIA_RIGHT_LEG,
      ]),
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
 * シンクロ召喚テスト用の状態を作成（フィールドにチューナー+非チューナー、EXにシンクロ）
 *
 * @param options - オプション設定
 *   - tunerLevel: チューナーのレベル（デフォルト: 2、null でチューナーなし）
 *   - nonTunerLevels: 非チューナーのレベル配列（デフォルト: [4]）
 *   - synchroLevel: シンクロモンスターのレベル（デフォルト: 6）
 */
export function createSynchroSummonReadyState(options?: {
  tunerLevel?: 1 | 2 | 3 | null;
  nonTunerLevels?: (1 | 2 | 3 | 4)[];
  synchroLevel?: 5 | 6 | 7 | 8;
}): ReturnType<typeof createMockGameState> {
  const tunerLevel = options?.tunerLevel !== undefined ? options.tunerLevel : 2;
  const nonTunerLevels = options?.nonTunerLevels ?? [4];
  const synchroLevel = options?.synchroLevel ?? 6;

  const tunerZone = tunerLevel !== null ? [createMonsterOnField("tuner-0", { isTuner: true, level: tunerLevel })] : [];

  return createMockGameState({
    space: {
      ...createFilledMainDeck(30),
      extraDeck: [
        createMonsterInstance("synchro-0", { frameType: "synchro", level: synchroLevel, location: "extraDeck" }),
      ],
      mainMonsterZone: [
        ...tunerZone,
        ...nonTunerLevels.map((lvl, index) => createMonsterOnField(`nontuner-${index}`, { level: lvl })),
      ],
    },
    phase: "main1",
  });
}
