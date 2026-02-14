/**
 * VictoryRule - 勝敗判定ルール
 *
 * @module domain/rules/VictoryRule
 * @see {@link docs/domain/rules/overview.md}
 * @see {@link docs/domain/rules/victory-conditions.md}
 */

import type { GameState, GameResult } from "../models/GameStateOld";
import { ExodiaNonEffect } from "../effects/rules/monsters/ExodiaNonEffect";

/**
 * 勝敗判定を行う
 *
 * 1. 特殊勝利条件 - AdditionalRuleパターンを使用
 * 2. ライフポイント0
 * 3. デッキアウト（未実装）
 */
export function checkVictoryConditions(state: GameState): GameResult {
  // 1. 特殊勝利条件のチェック
  const exodiaRule = new ExodiaNonEffect();
  if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) {
    return {
      isGameOver: true,
      winner: "player",
      reason: "exodia",
      message: `5つのエクゾディアパーツが手札に揃いました。勝利です！`,
    };
  }

  // 2. ライフポイント0のチェック
  if (state.lp.player <= 0) {
    return {
      isGameOver: true,
      winner: "opponent",
      reason: "lp0",
      message: `ライフポイントが0になりました。敗北です。`,
    };
  }
  if (state.lp.opponent <= 0) {
    return {
      isGameOver: true,
      winner: "player",
      reason: "lp0",
      message: `相手のライフポイントが0になりました。勝利です！`,
    };
  }

  // 3. デッキアウトのチェック
  // TODO: 実装箇所を要検討。現状発生しないので後回し

  // ゲーム進行中
  return {
    isGameOver: false,
  };
}
