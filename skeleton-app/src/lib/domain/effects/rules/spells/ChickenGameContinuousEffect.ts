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

import type { GameState } from "$lib/domain/models/GameState";
import type { RuleContext } from "$lib/domain/models/RuleContext";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/AdditionalRule";

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
   * 1. チキンレースがフィールドに存在するか (id: 67616300, position: "faceUp")
   * 2. ダメージ対象のLPが相手より少ないか
   *
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト
   * @returns 適用可能ならtrue
   */
  canApply(state: GameState, context: RuleContext): boolean {
    // 1. チキンレースがフィールドに存在するか
    const chickenGameOnField = state.zones.fieldZone.some((card) => card.id === 67616300 && card.position === "faceUp");

    if (!chickenGameOnField) {
      return false;
    }

    // 2. ダメージ対象のLPが相手より少ないか
    const damageTarget = context.damageTarget || "player";

    if (damageTarget === "player") {
      // プレイヤーがダメージを受ける場合、プレイヤーのLPが相手より少なければ適用
      return state.lp.player < state.lp.opponent;
    } else if (damageTarget === "opponent") {
      // 相手がダメージを受ける場合、相手のLPがプレイヤーより少なければ適用
      return state.lp.opponent < state.lp.player;
    }

    return false;
  }

  /**
   * ダメージ禁止チェック
   *
   * canApply()がtrueの場合、このメソッドが呼ばれてダメージを禁止する。
   *
   * @param _state - 現在のゲーム状態（未使用）
   * @param _context - ルール適用コンテキスト（未使用）
   * @returns ダメージ禁止（常にfalse）
   */
  checkPermission(_state: GameState, _context: RuleContext): boolean {
    // ダメージ禁止（false を返す）
    return false;
  }
}
