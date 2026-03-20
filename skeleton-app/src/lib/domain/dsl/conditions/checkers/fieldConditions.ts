/**
 * fieldConditions.ts - フィールド関連の条件チェック
 *
 * ConditionChecker:
 * - fieldHasEquippedNameIncludesCondition: フィールドに名前パターンを含む装備カードがあるか
 * - fieldHasMonsterWithRaceCondition: フィールドに指定種族のモンスターがあるか
 */

import { Card } from "$lib/domain/models/Card";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { createSimpleConditionChecker } from "../conditionFactory";
import { hasAtLeast, byNameIncludes, byRace, and, isMonster, type CardPredicate } from "../primitives/cardPredicates";

// ===========================
// 追加フィルター（fieldConditions固有）
// ===========================

/** 装備魔法カードか */
const isEquipSpell: CardPredicate = (card) => Card.isEquipSpell(card);

/** 表側表示か */
const isFaceUp: CardPredicate = (card) => Card.Instance.isFaceUp(card);

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

/**
 * FIELD_HAS_MONSTER_WITH_RACE - フィールドに指定種族のモンスターがあるか
 * args: { race: string }
 *
 * 表側表示の指定種族モンスターが存在するかをチェック
 */
export const fieldHasMonsterWithRaceCondition = createSimpleConditionChecker(
  (args) => ({ race: ArgValidators.nonEmptyString(args, "race") }),
  (state, { race }) => hasAtLeast(state.space.mainMonsterZone, and(isMonster, isFaceUp, byRace(race)), 1),
);
