/**
 * handConditions.ts - 手札関連の条件チェック
 *
 * 公開条件:
 * - handCount: 手札が指定枚数以上あるか
 * - handCountExcludingSelf: 自身を除く手札が指定枚数以上あるか
 *
 * @module domain/effects/conditions/handConditions
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

const { ERROR_CODES } = GameProcessing.Validation;

/** 手札が指定枚数以上あるか */
export const handCount = (state: GameSnapshot, minCount: number): ValidationResult => {
  if (state.space.hand.length >= minCount) {
    return GameProcessing.Validation.success();
  }
  return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/** 自身を除く手札が指定枚数以上あるか */
export const handCountExcludingSelf = (
  state: GameSnapshot,
  sourceInstance: CardInstance,
  minCount: number,
): ValidationResult => {
  const count = GameState.Space.countHandExcludingSelf(state.space, sourceInstance);
  if (count >= minCount) {
    return GameProcessing.Validation.success();
  }
  return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};
