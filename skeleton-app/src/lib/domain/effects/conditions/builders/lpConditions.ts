/**
 * lpConditions - LP関連の発動条件チェック
 *
 * 公開条件:
 * - lpAtLeast: LPが指定値以上かチェック
 * - lpGreaterThan: LPが指定値を超えているかチェック
 *
 * @module domain/effects/conditions/lpConditions
 */

import type { GameSnapshot, Player } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

const { ERROR_CODES } = GameProcessing.Validation;

/**
 * LPが指定値以上かチェック (LP >= amount)
 *
 * @param state - 現在のゲーム状態
 * @param amount - 必要なLP
 * @param target - チェック対象（デフォルト: player）
 */
export function lpAtLeast(state: GameSnapshot, amount: number, target: Player = "player"): ValidationResult {
  const currentLp = state.lp[target];

  if (currentLp >= amount) {
    return GameProcessing.Validation.success();
  }

  return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
}

/**
 * LPが指定値を超えているかチェック (LP > amount)
 *
 * @param state - 現在のゲーム状態
 * @param amount - 超えている必要があるLP
 * @param target - チェック対象（デフォルト: player）
 */
export function lpGreaterThan(state: GameSnapshot, amount: number, target: Player = "player"): ValidationResult {
  const currentLp = state.lp[target];

  if (currentLp > amount) {
    return GameProcessing.Validation.success();
  }

  return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
}
