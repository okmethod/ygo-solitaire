/**
 * GameSnapshot - イミュータブルなあるゲーム状態のスナップショット
 */

import type { CardSpace } from "./CardSpace";
import type { Player } from "./Player";
import type { GamePhase } from "./Phase";
import type { GameResult } from "./GameResult";
import { shuffleMainDeck, drawCards } from "./CardSpace";
import { getCardData } from "$lib/domain/registries/CardDataRegistry";

/** 初期ライフポイント */
export const INITIAL_LP = 8000 as const;

/** 両プレイヤーのライフポイント */
export type LifePoints = {
  readonly [P in Player]: number;
};

/** イミュータブルなゲーム状態のスナップショット */
export interface GameSnapshot {
  readonly space: CardSpace;
  readonly lp: LifePoints;
  readonly phase: GamePhase;
  readonly turn: number;
  readonly result: GameResult;

  /** 通常召喚権の数（デフォルト1、カード効果で増減可） */
  readonly normalSummonLimit: number;

  /** 通常召喚回数（初期値0、召喚・セット毎に+1） */
  readonly normalSummonUsed: number;

  /**
   * 発動済みカードID群
   * - カードIDをキーとして管理
   * - カード名を指定した「1 ターンに 1 度」制限の発動管理に使用
   * - 先行1ターン目のみのため、「1 デュエルに 1度」制限も兼ねる
   */
  readonly activatedCardIds: ReadonlySet<number>;

  /**
   * エンドフェイズに実行される遅延効果のID群
   * - エンドフェイズ時にIDからAtomicStepを生成して実行する
   * - 例: 無の煉獄、命削りの宝札、等
   */
  readonly queuedEndPhaseEffectIds: readonly string[];
}

/** デッキに含まれるカードID群を表す型エイリアス */
export type InitialDeckCardIds = {
  readonly mainDeckCardIds: readonly number[];
  readonly extraDeckCardIds: readonly number[];
};

// TODO: レジストリを参照する処理は、モデル層の外に出すべきかもしれない
/** 初期デッキ情報からGameSnapshotを生成する */
export function createInitialGameSnapshot(
  initialDeck: InitialDeckCardIds,
  options?: { skipShuffle?: boolean; skipInitialDraw?: boolean },
): GameSnapshot {
  // デッキカードを生成
  const mainDeckCards = initialDeck.mainDeckCardIds.map((cardId, index) => {
    const cardData = getCardData(cardId);
    return {
      ...cardData,
      instanceId: `main-${index}`,
      location: "mainDeck" as const,
      placedThisTurn: false,
      counters: [],
    };
  });
  const extraDeckCards = initialDeck.extraDeckCardIds.map((cardId, index) => {
    const cardData = getCardData(cardId);
    return {
      ...cardData,
      instanceId: `extra-${index}`,
      location: "extraDeck" as const,
      placedThisTurn: false,
      counters: [],
    };
  });

  // 初期ゾーン（シャッフル前）
  const initialSpace: CardSpace = {
    mainDeck: mainDeckCards,
    extraDeck: extraDeckCards,
    hand: [],
    mainMonsterZone: [],
    spellTrapZone: [],
    fieldZone: [],
    graveyard: [],
    banished: [],
  };

  // デッキをシャッフル（テスト時はスキップ可能）
  let finalSpace = options?.skipShuffle ? initialSpace : shuffleMainDeck(initialSpace);

  // 初期手札をドロー（テスト時はスキップ可能）
  if (!options?.skipInitialDraw) {
    finalSpace = drawCards(finalSpace, 5);
  }

  return {
    space: finalSpace,
    lp: {
      player: INITIAL_LP,
      opponent: INITIAL_LP,
    },
    phase: "draw",
    turn: 1,
    result: {
      isGameOver: false,
    },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };
}
