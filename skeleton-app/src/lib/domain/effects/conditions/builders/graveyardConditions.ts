/**
 * graveyardConditions.ts - 墓地関連の条件チェック
 *
 * 公開条件:
 * - graveyardHasSpell: 墓地に魔法カードが指定枚数以上あるか
 * - graveyardHasMonster: 墓地にモンスターカードが指定枚数以上あるか
 *
 * @module domain/effects/conditions/graveyardConditions
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

const { ERROR_CODES } = GameProcessing.Validation;

/** 墓地に魔法カードが指定枚数以上あるか */
export const graveyardHasSpell = (state: GameSnapshot, minCount: number): ValidationResult => {
  const spellCards = state.space.graveyard.filter((card) => card.type === "spell");
  if (spellCards.length >= minCount) {
    return GameProcessing.Validation.success();
  }
  return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/** 墓地にモンスターカードが指定枚数以上あるか */
export const graveyardHasMonster = (
  state: GameSnapshot,
  minCount: number,
  filter?: (card: CardInstance) => boolean,
): ValidationResult => {
  let monsters = state.space.graveyard.filter((card) => card.type === "monster");
  if (filter) {
    monsters = monsters.filter(filter);
  }
  if (monsters.length >= minCount) {
    return GameProcessing.Validation.success();
  }
  return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};
