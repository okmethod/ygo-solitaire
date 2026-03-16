/**
 * fieldConditions.ts - フィールド関連の条件チェック
 *
 * ConditionChecker:
 * - fieldHasEquippedNameIncludesCondition: フィールドに名前パターンを含む装備カードがあるか
 */

import { Card } from "$lib/domain/models/Card";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { createSimpleConditionChecker } from "../conditionFactory";
import { hasAtLeast, byNameIncludes, and, type CardPredicate } from "../primitives/cardPredicates";

// ===========================
// 追加フィルター（fieldConditions固有）
// ===========================

/** 装備魔法カードか */
const isEquipSpell: CardPredicate = (card) => Card.isEquipSpell(card);

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * FIELD_HAS_EQUIPPED_NAME_INCLUDES - フィールドに名前パターンを含む装備カードがあるか
 * args: { namePattern: string }
 */
export const fieldHasEquippedNameIncludesCondition = createSimpleConditionChecker(
  (args) => ({ namePattern: ArgValidators.nonEmptyString(args, "namePattern") }),
  (state, { namePattern }) => hasAtLeast(state.space.spellTrapZone, and(isEquipSpell, byNameIncludes(namePattern)), 1),
);
