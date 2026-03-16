/**
 * graveyardConditions.ts - 墓地関連の条件チェック
 *
 * ConditionChecker:
 * - graveyardHasSpellCondition: 墓地に魔法カードが指定枚数以上あるか
 * - graveyardHasMonsterCondition: 墓地にモンスターカードが指定枚数以上あるか
 * - graveyardHasSpellOrTrapCondition: 墓地に魔法・罠カードが指定枚数以上あるか
 */

import type { FrameSubType } from "$lib/domain/models/Card";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { createSimpleConditionChecker } from "../conditionFactory";
import { hasAtLeast, isSpell, isMonster, isSpellOrTrap, and, byFrameType } from "../primitives/cardPredicates";

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * GRAVEYARD_HAS_SPELL - 墓地に魔法カードが指定枚数以上あるか
 * args: { minCount?: number } (デフォルト: 1)
 */
export const graveyardHasSpellCondition = createSimpleConditionChecker(
  (args) => ({ minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1 }),
  (state, { minCount }) => hasAtLeast(state.space.graveyard, isSpell, minCount),
);

/**
 * GRAVEYARD_HAS_MONSTER - 墓地にモンスターカードが指定枚数以上あるか
 * args: { minCount?: number, frameType?: string } (デフォルト: minCount=1)
 */
export const graveyardHasMonsterCondition = createSimpleConditionChecker(
  (args) => ({
    minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1,
    frameType: ArgValidators.optionalString(args, "frameType") as FrameSubType | undefined,
  }),
  (state, { minCount, frameType }) => {
    const predicate = frameType ? and(isMonster, byFrameType(frameType)) : isMonster;
    return hasAtLeast(state.space.graveyard, predicate, minCount);
  },
);

/**
 * GRAVEYARD_HAS_SPELL_OR_TRAP - 墓地に魔法・罠カードが指定枚数以上あるか
 * args: { minCount?: number } (デフォルト: 1)
 */
export const graveyardHasSpellOrTrapCondition = createSimpleConditionChecker(
  (args) => ({ minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1 }),
  (state, { minCount }) => hasAtLeast(state.space.graveyard, isSpellOrTrap, minCount),
);
