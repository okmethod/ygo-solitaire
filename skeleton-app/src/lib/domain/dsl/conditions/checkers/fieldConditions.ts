/**
 * fieldConditions.ts - フィールド関連の条件チェック
 *
 * ConditionChecker:
 * - fieldHasEquippedNameIncludesCondition: フィールドに名前パターンを含む装備カードがあるか
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { createSimpleConditionChecker } from "../conditionFactory";

// ===========================
// 純粋関数（private）
// ===========================

/** フィールドに名前パターンを含む装備カードがあるか */
const fieldHasEquippedNameIncludes = (spellTrapZone: readonly CardInstance[], namePattern: string): boolean =>
  spellTrapZone.filter((card) => Card.isEquipSpell(card) && card.jaName.includes(namePattern)).length >= 1;

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * FIELD_HAS_EQUIPPED_NAME_INCLUDES - フィールドに名前パターンを含む装備カードがあるか
 * args: { namePattern: string }
 */
export const fieldHasEquippedNameIncludesCondition = createSimpleConditionChecker(
  (args) => ({ namePattern: ArgValidators.nonEmptyString(args, "namePattern") }),
  (state, { namePattern }) => fieldHasEquippedNameIncludes(state.space.spellTrapZone, namePattern),
);
