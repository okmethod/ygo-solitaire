/**
 * lpConditions - LP関連の発動条件チェック
 *
 * ConditionChecker:
 * - lpAtLeastCondition: LPが指定値以上かチェック
 * - lpGreaterThanCondition: LPが指定値を超えているかチェック
 */

import type { GameSnapshot, Player } from "$lib/domain/models/GameState";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ConditionChecker } from "../AtomicConditionRegistry";

const { success, failure, ERROR_CODES } = GameProcessing.Validation;

// ===========================
// 純粋関数（private）
// ===========================

/** LPが指定値以上か (LP >= amount) */
const lpAtLeast = (state: GameSnapshot, amount: number, target: Player): boolean => state.lp[target] >= amount;

/** LPが指定値を超えているか (LP > amount) */
const lpGreaterThan = (state: GameSnapshot, amount: number, target: Player): boolean => state.lp[target] > amount;

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * LP_AT_LEAST - プレイヤーのLPが指定値以上か
 * args: { amount: number, target?: "player" | "opponent" }
 */
export const lpAtLeastCondition: ConditionChecker = (state, _sourceInstance, args) => {
  const amount = args.amount as number;
  const target = (args.target as Player) ?? "player";

  if (typeof amount !== "number" || amount < 0) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return lpAtLeast(state, amount, target) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/**
 * LP_GREATER_THAN - プレイヤーのLPが指定値を超えているか
 * args: { amount: number, target?: "player" | "opponent" }
 */
export const lpGreaterThanCondition: ConditionChecker = (state, _sourceInstance, args) => {
  const amount = args.amount as number;
  const target = (args.target as Player) ?? "player";

  if (typeof amount !== "number" || amount < 0) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return lpGreaterThan(state, amount, target) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};
