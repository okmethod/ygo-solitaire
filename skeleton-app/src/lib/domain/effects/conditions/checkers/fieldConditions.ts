/**
 * fieldConditions.ts - フィールド関連の条件チェック
 *
 * ConditionChecker:
 * - fieldHasEquippedNameIncludesCondition: フィールドに名前パターンを含む装備カードがあるか
 */

import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ConditionChecker } from "../AtomicConditionRegistry";

const { success, failure, ERROR_CODES } = GameProcessing.Validation;

// ===========================
// 純粋関数（private）
// ===========================

/** フィールドに名前パターンを含む装備カードが存在するか */
const fieldHasEquippedNameIncludes = (state: GameSnapshot, namePattern: string, minCount: number): boolean =>
  state.space.spellTrapZone.filter((card) => Card.isEquipSpell(card) && card.jaName.includes(namePattern)).length >=
  minCount;

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * FIELD_HAS_EQUIPPED_NAME_INCLUDES - フィールドに名前パターンを含む装備カードがあるか
 * args: { namePattern: string }
 */
export const fieldHasEquippedNameIncludesCondition: ConditionChecker = (state, _sourceInstance, args) => {
  const namePattern = args.namePattern as string;

  if (!namePattern) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return fieldHasEquippedNameIncludes(state, namePattern, 1)
    ? success()
    : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};
