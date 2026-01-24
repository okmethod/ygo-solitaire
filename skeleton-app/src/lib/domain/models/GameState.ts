/**
 * GameState - ゲーム状態モデル
 *
 * すべてのゲーム操作は、新しい GameState インスタンスを返す。
 * プレーンなオブジェクトとして実装し、クラスを内包しないようにする。
 * （理由: 不変性担保 / Svelte 5 Runes での変更追跡性 / シリアライズ可能）
 *
 * @module domain/models/GameState
 * @see {@link docs/domain/overview.md}
 */

import type { Zones } from "$lib/domain/models/Zone";
import type { GamePhase } from "$lib/domain/models/Phase";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { getCardData } from "$lib/domain/registries/CardDataRegistry";
import { shuffleDeck, drawCards } from "$lib/domain/models/Zone";

/** 初期ライフポイント */
export const INITIAL_LP = 8000 as const;

/** 両プレイヤーのライフポイント */
export interface LifePoints {
  readonly player: number;
  readonly opponent: number;
}

/** チェーンブロック TODO: 詳細設計 */
export interface ChainBlock {
  readonly cardInstanceId: string;
  readonly effectDescription: string;
}

/** プレイヤー種別 */
export type PlayerType = "player" | "opponent";

/** ゲーム結果（勝敗判定） */
export interface GameResult {
  readonly isGameOver: boolean;
  readonly winner?: PlayerType | "draw";
  readonly reason?: "exodia" | "lp0" | "deckout" | "surrender";
  readonly message?: string;
}

/** イミュータブルなゲーム状態 */
export interface GameState {
  readonly zones: Zones;
  readonly lp: LifePoints;
  readonly phase: GamePhase;
  readonly turn: number;
  readonly chainStack: readonly ChainBlock[];
  readonly result: GameResult;

  /** 通常召喚権の数（デフォルト1、カード効果で増減可） */
  readonly normalSummonLimit: number;

  /** 通常召喚回数（初期値0、召喚・セット毎に+1） */
  readonly normalSummonUsed: number;

  // TODO: 効果関連をまとめて管理するオブジェクトが必要か検討する

  /**
   * カード名を指定した「1 ターンに 1 度」制限の発動管理
   * TODO: 単に activatedCardIds で良さそう。一律で記録して、制限は個別カード側に書く。
   * - カードID（数値）をキーとして管理
   * - いずれか1つしか発動できない系は、発動できなくなった効果を管理する
   * - 先行1ターン目のみのため、「1 デュエルに 1度」制限も兼ねる
   * - 例: 強欲で謙虚な壺、命削りの宝札、等
   * NOTE: フラグ名変更は将来検討（現状は互換性優先で維持）
   * 参考: https://yugioh.fandom.com/wiki/Once_per_turn
   */
  readonly activatedOncePerTurnCards: ReadonlySet<number>;

  /**
   * カード名指定のない「1 ターンに 1 度」制限の発動管理
   * - `${cardInstanceId}:${effectId}` をキーとして管理
   * FIXME: これだと、一度引っ込んだ後再度フィールドに出た場合にリセットされない。インスタンス側が持つべきステートな気がする。
   * - いずれか1つしか発動できない系は、発動できなくなった効果を管理する
   * - 例: チキンレースの起動効果、等
   * NOTE: フラグ名変更は将来検討（現状は互換性優先で維持）
   * 参考: https://yugioh.fandom.com/wiki/Once_per_turn#Only_once_per_turn
   */
  readonly activatedIgnitionEffectsThisTurn: ReadonlySet<string>;

  /**
   * エンドフェイズに実行される遅延効果
   * 例: 無の煉獄、命削りの宝札、等
   */
  readonly pendingEndPhaseEffects: readonly AtomicStep[];

  /**
   * ダメージ無効化フラグ
   * 例: 一時休戦、等
   * trueの場合、このターンのダメージは全て無効化される
   * NOTE: 片方のみ無効化（チキンレース等）の実装は将来的に必要になった時点で検討
   */
  readonly damageNegation: boolean;
}

/** デッキに含まれるカードID群を表す型エイリアス */
export type InitialDeckCardIds = {
  readonly mainDeckCardIds: readonly number[];
  readonly extraDeckCardIds: readonly number[];
};

/** 初期デッキ情報からGameStateを生成する */
export function createInitialGameState(
  initialDeck: InitialDeckCardIds,
  options?: { skipShuffle?: boolean; skipInitialDraw?: boolean },
): GameState {
  // デッキカードを生成
  const deckCards = initialDeck.mainDeckCardIds.map((cardId, index) => {
    const cardData = getCardData(cardId);
    return {
      ...cardData,
      instanceId: `deck-${index}`,
      location: "deck" as const,
      placedThisTurn: false,
    };
  });

  // 初期ゾーン（シャッフル前）
  const initialZones: Zones = {
    // TODO: メインデッキとエクストラデッキを分離する
    deck: deckCards,
    hand: [],
    mainMonsterZone: [],
    spellTrapZone: [],
    fieldZone: [],
    graveyard: [],
    banished: [],
  };

  // デッキをシャッフル（テスト時はスキップ可能）
  let finalZones = options?.skipShuffle ? initialZones : shuffleDeck(initialZones);

  // 初期手札をドロー（テスト時はスキップ可能）
  if (!options?.skipInitialDraw) {
    finalZones = drawCards(finalZones, 5);
  }

  return {
    zones: finalZones,
    lp: {
      player: INITIAL_LP,
      opponent: INITIAL_LP,
    },
    phase: "Draw",
    turn: 1,
    chainStack: [],
    result: {
      isGameOver: false,
    },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedIgnitionEffectsThisTurn: new Set<string>(),
    activatedOncePerTurnCards: new Set<number>(),
    pendingEndPhaseEffects: [],
    damageNegation: false,
  };
}
