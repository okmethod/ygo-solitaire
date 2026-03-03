/**
 * activationConditions.ts - 発動条件関連の条件チェック
 *
 * 公開条件:
 * - oncePerTurn: このカードがこのターンまだ発動されていないか
 * - oncePerTurnEffect: この効果がこのターンまだ発動されていないか（フィールド上のカード用）
 *
 * @module domain/effects/conditions/activationConditions
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { EffectId } from "$lib/domain/models/Effect";
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

/**
 * この効果がこのターンまだ発動されていないか（フィールド上のカード用）
 *
 * フィールド上のカードに対して、特定の効果IDがこのターン発動済みかチェックする。
 */
export const oncePerTurnEffect = (sourceInstance: CardInstance, effectId: EffectId): ValidationResult => {
  if (sourceInstance.stateOnField?.activatedEffects?.has(effectId)) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  return GameProcessing.Validation.success();
};
