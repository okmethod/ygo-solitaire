/**
 * counterConditions.ts - カウンター関連の条件チェック
 *
 * ConditionChecker:
 * - hasCounterCondition: カードに指定タイプのカウンターが指定枚数以上あるか
 */

import type { CardInstance, CounterType } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ConditionChecker } from "../AtomicConditionRegistry";

const { success, failure, ERROR_CODES } = GameProcessing.Validation;

// ===========================
// 純粋関数（private）
// ===========================

/** カードに指定タイプのカウンターが指定枚数以上あるか */
const hasCounter = (sourceInstance: CardInstance, counterType: CounterType, minCount: number): boolean => {
  const counters = sourceInstance.stateOnField?.counters ?? [];
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
export const hasCounterCondition: ConditionChecker = (_state, sourceInstance, args) => {
  const counterType = args.counterType as CounterType;
  const minCount = args.minCount as number;

  if (!counterType) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  if (typeof minCount !== "number" || minCount < 1) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return hasCounter(sourceInstance, counterType, minCount) ? success() : failure(ERROR_CODES.INSUFFICIENT_COUNTERS);
};
