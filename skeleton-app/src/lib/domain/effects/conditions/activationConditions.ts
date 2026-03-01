/**
 * activationConditions.ts - 発動条件関連の条件チェック
 *
 * 公開条件:
 * - oncePerTurn: このカードがこのターンまだ発動されていないか
 *
 * @module domain/effects/conditions/activationConditions
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

const { ERROR_CODES } = GameProcessing.Validation;

/** このカードがこのターンまだ発動されていないか */
export const oncePerTurn = (state: GameSnapshot, cardId: number): ValidationResult => {
  if (state.activatedCardIds.has(cardId)) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  return GameProcessing.Validation.success();
};
