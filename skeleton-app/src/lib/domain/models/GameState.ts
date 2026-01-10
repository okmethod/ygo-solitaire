/**
 * GameState - Immutable game state representation
 *
 * This is the central state object for the Yu-Gi-Oh! solitaire game.
 * All game operations return a new GameState instance (immutability via Immer.js).
 *
 * @module domain/models/GameState
 */

import type { Zones } from "./Zone";
import type { GamePhase } from "./Phase";
import type { EffectResolutionStep } from "./EffectResolutionStep";
import { getCardData } from "../registries/CardDataRegistry";

/**
 * Initial life points for both players
 */
export const INITIAL_LP = 8000 as const;

/**
 * Life Points for both players
 */
export interface LifePoints {
  readonly player: number;
  readonly opponent: number;
}

/**
 * Chain block in the chain stack
 * Represents a spell/trap activation waiting to resolve
 */
export interface ChainBlock {
  readonly cardInstanceId: string;
  readonly effectDescription: string;
}

/**
 * Game result state
 */
export interface GameResult {
  readonly isGameOver: boolean;
  readonly winner?: "player" | "opponent" | "draw";
  readonly reason?: "exodia" | "lp0" | "deckout" | "surrender";
  readonly message?: string;
}

/**
 * Main game state interface
 * All fields are readonly to enforce immutability at type level
 */
export interface GameState {
  readonly zones: Zones;
  readonly lp: LifePoints;
  readonly phase: GamePhase;
  readonly turn: number;
  readonly chainStack: readonly ChainBlock[];
  readonly result: GameResult;

  /**
   * 通常召喚可能回数（デフォルト1、カード効果で増減可）
   * 例: Double Summon発動時は2になる
   */
  readonly normalSummonLimit: number;

  /**
   * 通常召喚使用回数（初期値0、召喚・セット毎に+1）
   * 召喚権の残り確認: normalSummonUsed < normalSummonLimit
   */
  readonly normalSummonUsed: number;

  /**
   * カード名を指定した「1 ターンに 1 度」制限の発動管理
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
  readonly pendingEndPhaseEffects: readonly EffectResolutionStep[];

  /**
   * ダメージ無効化フラグ
   * 例: 一時休戦、等
   * trueの場合、このターンのダメージは全て無効化される
   * NOTE: 片方のみ無効化（チキンレース等）の実装は将来的に必要になった時点で検討
   */
  readonly damageNegation: boolean;
}

/**
 * Create initial game state
 *
 * @param deckCardIds - Array of numeric card IDs for the main deck
 * @returns Initial GameState
 */
export function createInitialGameState(deckCardIds: number[]): GameState {
  return {
    zones: {
      deck: deckCardIds.map((cardId, index) => {
        const cardData = getCardData(cardId);
        return {
          ...cardData,
          instanceId: `deck-${index}`,
          location: "deck" as const,
        };
      }),
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

/**
 * Helper to get card instance by ID
 *
 * @param state - Current game state
 * @param instanceId - Card instance ID to find
 * @returns Card instance or undefined if not found
 */
export function findCardInstance(state: GameState, instanceId: string) {
  const allZones = [
    ...state.zones.deck,
    ...state.zones.hand,
    ...state.zones.mainMonsterZone,
    ...state.zones.spellTrapZone,
    ...state.zones.fieldZone,
    ...state.zones.graveyard,
    ...state.zones.banished,
  ];

  return allZones.find((card) => card.instanceId === instanceId);
}
