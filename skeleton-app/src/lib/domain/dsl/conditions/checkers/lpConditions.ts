/**
 * lpConditions - LP関連の発動条件チェック
 *
 * ConditionChecker:
 * - lpAtLeastCondition: LPが指定値以上かチェック
 * - lpGreaterThanCondition: LPが指定値を超えているかチェック
 */

import { ArgValidators } from "$lib/domain/dsl/argValidators";
import { createSimpleConditionChecker } from "../conditionFactory";

type LifePoints = { readonly player: number; readonly opponent: number };

// ===========================
// 純粋関数（private）
// ===========================

/** プレイヤーのLPが指定値以上か */
const lpAtLeast = (lp: LifePoints, target: "player" | "opponent", amount: number): boolean => lp[target] >= amount;

/** プレイヤーのLPが指定値を超えているか */
const lpGreaterThan = (lp: LifePoints, target: "player" | "opponent", amount: number): boolean => lp[target] > amount;

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * LP_AT_LEAST - プレイヤーのLPが指定値以上か
 * args: { amount: number, target?: "player" | "opponent" }
 */
export const lpAtLeastCondition = createSimpleConditionChecker(
  (args) => ({
    amount: ArgValidators.nonNegativeInt(args, "amount"),
    target: ArgValidators.optionalPlayer(args, "target", "player"),
  }),
  (state, { amount, target }) => lpAtLeast(state.lp, target, amount),
);

/**
 * LP_GREATER_THAN - プレイヤーのLPが指定値を超えているか
 * args: { amount: number, target?: "player" | "opponent" }
 */
export const lpGreaterThanCondition = createSimpleConditionChecker(
  (args) => ({
    amount: ArgValidators.nonNegativeInt(args, "amount"),
    target: ArgValidators.optionalPlayer(args, "target", "player"),
  }),
  (state, { amount, target }) => lpGreaterThan(state.lp, target, amount),
);
