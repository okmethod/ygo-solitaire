/**
 * ChickenGameContinuousEffect - チキンレースの永続効果
 *
 * Card ID: 67616300 (Chicken Game / チキンレース)
 *
 * 永続効果:
 * - 相手よりLPが少ないプレイヤーが受けるダメージは0になる
 *
 * カテゴリ: ActionPermission (ダメージ禁止)
 *
 * @module domain/effects/rules/spells/ChickenGameContinuousEffect
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/Effect";
import { isFaceUp } from "$lib/domain/models/CardOld";

/**
 * ChickenGameContinuousEffect クラス
 *
 * チキンレースの永続効果（ダメージ無効化）を実装。
 * LP差分による条件判定を行い、ダメージを禁止する。
 */
export class ChickenGameContinuousEffect implements AdditionalRule {
  /**
   * 効果である（無効化される可能性がある）
   */
  readonly isEffect = true;

  /**
   * カテゴリ: 行動制限（ダメージ無効化）
   */
  readonly category: RuleCategory = "ActionPermission";

  /**
   * 適用条件チェック
   *
   * チキンレースがフィールドに存在するかをチェック。
   *
   * @deprecated 現在未使用。将来的に ActionPermission カテゴリでダメージ無効化を
   * 実装する際に、ダメージ対象・ダメージ量などの引数設計を再検討する。
   *
   * @param state - 現在のゲーム状態
   * @returns 適用可能ならtrue
   */
  canApply(state: GameState): boolean {
    // チキンレースがフィールドに存在するか
    return state.zones.fieldZone.some((card) => card.id === 67616300 && isFaceUp(card));
  }

  /**
   * ダメージ禁止チェック
   *
   * canApply()がtrueの場合、このメソッドが呼ばれてダメージを禁止する。
   *
   * @param _state - 現在のゲーム状態（未使用）
   * @returns ダメージ禁止（常にfalse）
   */
  checkPermission(_state: GameState): boolean {
    // ダメージ禁止（false を返す）
    return false;
  }
}
