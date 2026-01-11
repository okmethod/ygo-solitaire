/**
 * VictoryRule - Victory condition validation
 *
 * Implements the victory/defeat conditions for Yu-Gi-Oh!:
 * - Special victory conditions (Exodia, etc.) - using AdditionalRule pattern
 * - LP0 victory (opponent's LP reaches 0)
 * - Deck out defeat (cannot draw from empty deck)
 *
 * @module domain/rules/VictoryRule
 */

import type { GameState, GameResult } from "../models/GameState";
import { ExodiaNonEffect } from "../effects/rules/monster/ExodiaNonEffect";

/**
 * Check victory conditions and return game result
 *
 * Priority order:
 * 1. Special victory conditions (Exodia, etc.)
 * 2. Basic victory conditions (LP0, deck out)
 *
 * @param state - Current game state
 * @returns GameResult with victory/defeat information
 */
export function checkVictoryConditions(state: GameState): GameResult {
  // 1. Special victory conditions (AdditionalRule pattern)
  const exodiaRule = new ExodiaNonEffect();
  if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) {
    return {
      isGameOver: true,
      winner: "player",
      reason: "exodia",
      message: `5つのエクゾディアパーツが手札に揃いました。勝利です！`,
    };
  }

  // 2. Basic victory conditions (hardcoded)

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
  // Note: Skip this check during game initialization (turn = 0, phase = "Draw")
  if (state.zones.deck.length === 0 && state.phase === "Draw" && state.turn > 0) {
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
