/**
 * ExodiaVictoryRule - エクゾディアの特殊勝利条件
 *
 * 効果外テキスト: 手札にエクゾディア5パーツが揃った時、デュエルに勝利する
 *
 * カテゴリ: VictoryCondition（特殊勝利条件）
 *
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 * @see specs/009-victory-rule-refactor/spec.md
 * @module domain/effects/additional/ExodiaVictoryRule
 */

import type { AdditionalRule, RuleCategory } from "../../models/AdditionalRule";
import type { RuleContext } from "../../models/RuleContext";
import type { GameState } from "../../models/GameState";
import { hasExodiaInHand } from "../../models/GameState";

/**
 * ExodiaVictoryRule - エクゾディアの特殊勝利条件
 *
 * AdditionalRuleインターフェースを実装し、エクゾディアの勝利条件を表現する。
 *
 * @example
 * ```typescript
 * const exodiaRule = new ExodiaVictoryRule();
 * if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) {
 *   // Exodia victory!
 * }
 * ```
 */
export class ExodiaVictoryRule implements AdditionalRule {
  /**
   * 効果外テキストである（無効化されない）
   *
   * isEffect: false により、「効果を無効にする効果」の影響を受けない
   */
  readonly isEffect = false;

  /**
   * カテゴリ: 特殊勝利条件
   */
  readonly category: RuleCategory = "VictoryCondition";

  /**
   * 適用条件チェック
   *
   * 手札にエクゾディア5パーツが揃っているかを判定する。
   *
   * @param state - 現在のゲーム状態
   * @param _context - ルール適用コンテキスト（未使用）
   * @returns 5パーツが揃っている場合true
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canApply(state: GameState, _context: RuleContext): boolean {
    return hasExodiaInHand(state);
  }

  /**
   * 勝利条件判定
   *
   * canApply()がtrueの場合、このメソッドが呼ばれて勝利を判定する。
   * エクゾディアの場合、5パーツが揃っていれば必ず勝利。
   *
   * @param _state - 現在のゲーム状態（未使用）
   * @param _context - ルール適用コンテキスト（未使用）
   * @returns 勝利条件を満たしている（常にtrue）
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkPermission(_state: GameState, _context: RuleContext): boolean {
    return true;
  }
}
