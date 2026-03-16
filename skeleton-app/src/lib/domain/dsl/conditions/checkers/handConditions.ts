/**
 * handConditions.ts - 手札関連の条件チェック
 *
 * ConditionChecker:
 * - handCountCondition: 手札が指定枚数以上あるか
 * - handCountExcludingSelfCondition: 自身を除く手札が指定枚数以上あるか
 * - handHasSpellCondition: 手札に魔法カードが指定枚数以上あるか（自身を除く）
 */

import { GameState } from "$lib/domain/models/GameState";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { createConditionChecker, createSimpleConditionChecker } from "../conditionFactory";
import { hasAtLeast, isSpell, and, excludingInstance } from "../primitives/cardPredicates";

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * HAND_COUNT - 手札が指定枚数以上あるか
 * args: { minCount: number }
 */
export const handCountCondition = createSimpleConditionChecker(
  (args) => ({ minCount: ArgValidators.positiveInt(args, "minCount") }),
  (state, { minCount }) => state.space.hand.length >= minCount,
);

/**
 * HAND_COUNT_EXCLUDING_SELF - 自身を除く手札が指定枚数以上あるか
 * args: { minCount: number }
 */
export const handCountExcludingSelfCondition = createConditionChecker(
  (args) => ({ minCount: ArgValidators.positiveInt(args, "minCount") }),
  (state, sourceInstance, { minCount }) =>
    GameState.Space.countHandExcludingSelf(state.space, sourceInstance) >= minCount,
);

/**
 * HAND_HAS_SPELL - 手札に魔法カードが指定枚数以上あるか（自身を除く）
 * args: { minCount?: number } (デフォルト: 1)
 */
export const handHasSpellCondition = createConditionChecker(
  (args) => ({ minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1 }),
  (state, sourceInstance, { minCount }) =>
    hasAtLeast(state.space.hand, and(isSpell, excludingInstance(sourceInstance.instanceId)), minCount),
);
