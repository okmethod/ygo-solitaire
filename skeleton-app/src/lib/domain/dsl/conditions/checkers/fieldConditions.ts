/**
 * fieldConditions.ts - フィールド関連の条件チェック
 *
 * ConditionChecker:
 * - fieldHasEquippedNameIncludesCondition: フィールドに名前パターンを含む装備カードがあるか
 * - fieldHasMonsterWithRaceCondition: フィールドに指定種族のモンスターがあるか
 */

import type { CardType } from "$lib/domain/models/Card";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { createSimpleConditionChecker } from "../conditionFactory";
import {
  hasAtLeast,
  byNameIncludes,
  byRace,
  byType,
  and,
  isMonster,
  isNonEffectMonster,
  isEquipSpell,
  isFaceUp,
} from "../primitives/cardPredicates";

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * FIELD_HAS_CARD - フィールドに条件に合うカードが指定枚数以上あるか
 * args: { filterType: string, minCount?: number }
 *
 * filterType: "monster" の場合はモンスターゾーンを、それ以外は魔法・罠ゾーンをチェック
 */
export const fieldHasCardCondition = createSimpleConditionChecker(
  (args) => ({
    filterType: ArgValidators.nonEmptyString(args, "filterType") as CardType,
    minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1,
  }),
  (state, { filterType, minCount }) => {
    const zone = filterType === "monster" ? state.space.mainMonsterZone : state.space.spellTrapZone;
    return hasAtLeast(zone, byType(filterType), minCount);
  },
);

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

/**
 * FIELD_HAS_NON_EFFECT_MONSTER - フィールドに効果モンスター以外の表側表示モンスターがあるか
 * args: { minCount?: number } (デフォルト: 1)
 *
 * 効果モンスター以外（通常、儀式、融合、シンクロ等）の表側表示モンスターが存在するかをチェック
 */
export const fieldHasNonEffectMonsterCondition = createSimpleConditionChecker(
  (args) => ({ minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1 }),
  (state, { minCount }) =>
    hasAtLeast(state.space.mainMonsterZone, and(isMonster, isFaceUp, isNonEffectMonster), minCount),
);
