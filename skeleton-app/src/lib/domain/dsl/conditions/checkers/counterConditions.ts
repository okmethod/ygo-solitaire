/**
 * counterConditions.ts - カウンター関連の条件チェック
 *
 * ConditionChecker:
 * - hasCounterCondition: カードに指定タイプのカウンターが指定枚数以上あるか
 */

import type { CounterType, CounterState } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { createConditionChecker } from "../conditionFactory";

const { ERROR_CODES } = GameProcessing.Validation;

// ===========================
// 純粋関数（private）
// ===========================

/** カードに指定タイプのカウンターが指定枚数以上あるか */
const hasCounter = (counters: readonly CounterState[], counterType: CounterType, minCount: number): boolean => {
  const currentCount = Card.Counter.get(counters, counterType);
  return currentCount >= minCount;
};

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * HAS_COUNTER - 発動元カードに指定タイプのカウンターが指定枚数以上あるか
 * args: { counterType: CounterType, minCount: number }
 */
export const hasCounterCondition = createConditionChecker(
  (args) => ({
    counterType: ArgValidators.nonEmptyString(args, "counterType") as CounterType,
    minCount: ArgValidators.positiveInt(args, "minCount"),
  }),
  (_state, sourceInstance, { counterType, minCount }) => {
    const counters = sourceInstance.stateOnField?.counters ?? [];
    return hasCounter(counters, counterType, minCount);
  },
  ERROR_CODES.INSUFFICIENT_COUNTERS,
);
