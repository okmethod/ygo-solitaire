/**
 * VictoryCondition - 勝敗判定
 *
 * 現状、カード固有の特殊勝利条件もここで判定している。
 * 将来的に、数が増えてきたら AdditionalRuleパターンに移行するかもしれない。
 */

import type { GameSnapshot } from "./GameSnapshot";
import type { GameResult } from "./GameResult";

const checkExodiaVictory = (state: GameSnapshot): boolean => {
  const EXODIA_PIECE_IDS = [
    33396948, // 本体
    7902349, // 左腕
    70903634, // 右腕
    44519536, // 左足
    8124921, // 右足
  ] as const;

  const handCardIds = state.space.hand.map((card) => card.id);
  const hasAllExodiaParts = EXODIA_PIECE_IDS.every((id) => handCardIds.includes(id));
  return hasAllExodiaParts;
};

/**
 * 勝敗判定を行う
 *
 * 1. 特殊勝利条件
 *   - エクゾディア
 * 2. ライフポイント0
 * 3. デッキアウト（未実装）
 */
const checkedVictoryResult = (state: GameSnapshot): GameResult => {
  // 1. 特殊勝利条件のチェック
  // エクゾディア
  if (checkExodiaVictory(state)) {
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
};

/** 勝利判定結果を反映済みのゲーム状態を返す */
export const checkedVictoryState = (state: GameSnapshot): GameSnapshot => {
  if (state.result?.isGameOver) {
    // すでにゲームオーバーの場合は、再計算せずにそのまま返す
    return state;
  }

  return {
    ...state,
    result: checkedVictoryResult(state),
  };
};
