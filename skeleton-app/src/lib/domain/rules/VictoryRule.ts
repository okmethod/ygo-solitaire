/**
 * VictoryRule - Victory condition validation
 *
 * Implements the victory/defeat conditions for Yu-Gi-Oh!:
 * - Exodia victory (all 5 pieces in hand)
 * - LP0 victory (opponent's LP reaches 0)
 * - Deck out defeat (cannot draw from empty deck)
 *
 * @module domain/rules/VictoryRule
 */

import type { GameState, GameResult } from "../models/GameState";
import { hasExodiaInHand } from "../models/GameState";
import { EXODIA_PIECE_IDS } from "../models/constants";

/**
 * Check victory conditions and return game result
 *
 * @param state - Current game state
 * @returns GameResult with victory/defeat information
 */
export function checkVictoryConditions(state: GameState): GameResult {
  // Check Exodia victory
  if (hasExodiaInHand(state)) {
    return {
      isGameOver: true,
      winner: "player",
      reason: "exodia",
      message: `エクゾディア揃った！5つのパーツが手札に揃いました。勝利です！`,
    };
  }

  // Check LP0 defeat (player's LP reaches 0)
  if (state.lp.player <= 0) {
    return {
      isGameOver: true,
      winner: "opponent",
      reason: "lp0",
      message: `ライフポイントが0になりました。敗北です。`,
    };
  }

  // Check LP0 victory (opponent's LP reaches 0)
  if (state.lp.opponent <= 0) {
    return {
      isGameOver: true,
      winner: "player",
      reason: "lp0",
      message: `相手のライフポイントが0になりました。勝利です！`,
    };
  }

  // Check deck out defeat (cannot draw from empty deck)
  if (state.zones.deck.length === 0 && state.phase === "Draw") {
    return {
      isGameOver: true,
      winner: "opponent",
      reason: "deckout",
      message: `デッキが空でドローできません。デッキアウトで敗北です。`,
    };
  }

  // No victory/defeat conditions met - game continues
  return {
    isGameOver: false,
  };
}

/**
 * Check if player has won via Exodia
 *
 * @param state - Current game state
 * @returns True if all 5 Exodia pieces are in hand
 */
export function hasExodiaVictory(state: GameState): boolean {
  return hasExodiaInHand(state);
}

/**
 * Check if player has lost due to LP reaching 0
 *
 * @param state - Current game state
 * @returns True if player's LP is 0 or below
 */
export function hasLPDefeat(state: GameState): boolean {
  return state.lp.player <= 0;
}

/**
 * Check if player has won due to opponent's LP reaching 0
 *
 * @param state - Current game state
 * @returns True if opponent's LP is 0 or below
 */
export function hasLPVictory(state: GameState): boolean {
  return state.lp.opponent <= 0;
}

/**
 * Check if player has lost due to deck out
 *
 * @param state - Current game state
 * @returns True if deck is empty during Draw phase
 */
export function hasDeckOutDefeat(state: GameState): boolean {
  return state.zones.deck.length === 0 && state.phase === "Draw";
}

/**
 * Get missing Exodia pieces (for UI hints)
 *
 * @param state - Current game state
 * @returns Array of missing Exodia piece card IDs
 */
export function getMissingExodiaPieces(state: GameState): string[] {
  const handCardIds = state.zones.hand.map((card) => card.cardId);
  return EXODIA_PIECE_IDS.filter((pieceId) => !handCardIds.includes(pieceId));
}

/**
 * Get number of Exodia pieces in hand (for UI display)
 *
 * @param state - Current game state
 * @returns Number of Exodia pieces currently in hand (0-5)
 */
export function countExodiaPiecesInHand(state: GameState): number {
  const handCardIds = state.zones.hand.map((card) => card.cardId);
  return EXODIA_PIECE_IDS.filter((pieceId) => handCardIds.includes(pieceId)).length;
}
