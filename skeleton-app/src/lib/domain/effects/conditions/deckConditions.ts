/**
 * deckConditions.ts - デッキ関連の条件チェック
 *
 * 公開条件:
 * - canDraw: デッキに指定枚数以上のカードがあるか
 * - deckHasCard: デッキに条件に合うカードが指定枚数以上あるか
 *
 * @module domain/effects/conditions/deckConditions
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

const { ERROR_CODES } = GameProcessing.Validation;

/** デッキに指定枚数以上のカードがあるか */
export const canDraw = (state: GameSnapshot, count: number): ValidationResult => {
  if (state.space.mainDeck.length >= count) {
    return GameProcessing.Validation.success();
  }
  return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/** デッキに条件に合うカードが指定枚数以上あるか */
export const deckHasCard = (
  state: GameSnapshot,
  filter: (card: CardInstance) => boolean,
  minCount: number,
): ValidationResult => {
  const matchingCards = state.space.mainDeck.filter(filter);
  if (matchingCards.length >= minCount) {
    return GameProcessing.Validation.success();
  }
  return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};
