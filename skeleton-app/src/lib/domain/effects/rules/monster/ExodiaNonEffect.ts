/**
 * ExodiaVictoryRule - エクゾディアの特殊勝利条件
 *
 * 効果外テキスト: 手札にエクゾディア5パーツが揃った時、デュエルに勝利する
 *
 * カテゴリ: VictoryCondition（特殊勝利条件）
 *
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 * @see specs/009-victory-rule-refactor/spec.md
 * @module domain/effects/rules/spell/ExodiaNonEffect
 */

import type { AdditionalRule, RuleCategory } from "../../../models/AdditionalRule";
import type { RuleContext } from "../../../models/RuleContext";
import type { GameState } from "../../../models/GameState";

/**
 * ExodiaNonEffect - エクゾディアの特殊勝利条件
 *
 * AdditionalRuleインターフェースを実装し、エクゾディアの勝利条件を表現する。
 * エクゾディア5パーツのIDと判定ロジックをカプセル化する。
 *
 * @example
 * ```typescript
 * const exodiaRule = new ExodiaNonEffect();
 * if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) {
 *   // Exodia victory!
 * }
 * ```
 */
export class ExodiaNonEffect implements AdditionalRule {
  /**
   * エクゾディア5パーツのカードID（数値形式）
   * All 5 pieces must be in hand simultaneously to win
   * @private
   */
  private static readonly EXODIA_PIECE_IDS = [
    33396948, // Exodia the Forbidden One (head)
    7902349, // Right Arm of the Forbidden One
    70903634, // Left Arm of the Forbidden One
    8124921, // Right Leg of the Forbidden One
    44519536, // Left Leg of the Forbidden One
  ] as const;

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
  canApply(state: GameState, _context: RuleContext): boolean {
    const handCardIds = state.zones.hand.map((card) => card.id);
    return ExodiaNonEffect.EXODIA_PIECE_IDS.every((pieceId) => handCardIds.includes(pieceId));
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
  checkPermission(_state: GameState, _context: RuleContext): boolean {
    return true;
  }

  /**
   * エクゾディアパーツのIDを取得（テスト・外部利用用）
   *
   * @returns エクゾディア5パーツのID配列（読み取り専用）
   */
  static getExodiaPieceIds(): readonly number[] {
    return ExodiaNonEffect.EXODIA_PIECE_IDS;
  }
}
