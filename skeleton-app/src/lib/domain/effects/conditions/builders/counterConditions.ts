/**
 * counterConditions.ts - カウンター関連の条件チェック
 *
 * 公開条件:
 * - hasCounter: カードに指定タイプのカウンターが指定枚数以上あるか
 *
 * @module domain/effects/conditions/counterConditions
 */

import type { CardInstance, CounterType } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

const { ERROR_CODES } = GameProcessing.Validation;

/** カードに指定タイプのカウンターが指定枚数以上あるか */
export const hasCounter = (
  sourceInstance: CardInstance,
  counterType: CounterType,
  minCount: number,
): ValidationResult => {
  const counters = sourceInstance.stateOnField?.counters ?? [];
  const currentCount = Card.Counter.get(counters, counterType);

  if (currentCount >= minCount) {
    return GameProcessing.Validation.success();
  }
  return GameProcessing.Validation.failure(ERROR_CODES.INSUFFICIENT_COUNTERS);
};
