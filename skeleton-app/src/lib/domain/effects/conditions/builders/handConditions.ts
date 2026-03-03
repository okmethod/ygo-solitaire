/**
 * handConditions.ts - 手札関連の条件チェック
 *
 * ConditionChecker:
 * - handCountCondition: 手札が指定枚数以上あるか
 * - handCountExcludingSelfCondition: 自身を除く手札が指定枚数以上あるか
 * - handHasSpellCondition: 手札に魔法カードが指定枚数以上あるか（自身を除く）
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ConditionChecker } from "../AtomicConditionRegistry";

const { success, failure, ERROR_CODES } = GameProcessing.Validation;

// ===========================
// 純粋関数（private）
// ===========================

/** 手札が指定枚数以上あるか */
const handCount = (state: GameSnapshot, minCount: number): boolean => state.space.hand.length >= minCount;

/** 自身を除く手札が指定枚数以上あるか */
const handCountExcludingSelf = (state: GameSnapshot, sourceInstance: CardInstance, minCount: number): boolean =>
  GameState.Space.countHandExcludingSelf(state.space, sourceInstance) >= minCount;

/** 手札に魔法カードが指定枚数以上あるか（自身を除く） */
const handHasSpell = (state: GameSnapshot, sourceInstance: CardInstance, minCount: number): boolean =>
  state.space.hand.filter((card) => card.type === "spell" && card.instanceId !== sourceInstance.instanceId).length >=
  minCount;

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * HAND_COUNT - 手札が指定枚数以上あるか
 * args: { minCount: number }
 */
export const handCountCondition: ConditionChecker = (state, _sourceInstance, args) => {
  const minCount = args.minCount as number;
  if (typeof minCount !== "number" || minCount < 1) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  return handCount(state, minCount) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/**
 * HAND_COUNT_EXCLUDING_SELF - 自身を除く手札が指定枚数以上あるか
 * args: { minCount: number }
 */
export const handCountExcludingSelfCondition: ConditionChecker = (state, sourceInstance, args) => {
  const minCount = args.minCount as number;
  if (typeof minCount !== "number" || minCount < 1) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  return handCountExcludingSelf(state, sourceInstance, minCount)
    ? success()
    : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/**
 * HAND_HAS_SPELL - 手札に魔法カードが指定枚数以上あるか（自身を除く）
 * args: { minCount?: number } (デフォルト: 1)
 */
export const handHasSpellCondition: ConditionChecker = (state, sourceInstance, args) => {
  const minCount = (args.minCount as number) ?? 1;
  return handHasSpell(state, sourceInstance, minCount) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};
