/**
 * graveyardConditions.ts - 墓地関連の条件チェック
 *
 * ConditionChecker:
 * - graveyardHasSpellCondition: 墓地に魔法カードが指定枚数以上あるか
 * - graveyardHasMonsterCondition: 墓地にモンスターカードが指定枚数以上あるか
 * - graveyardHasSpellOrTrapCondition: 墓地に魔法・罠カードが指定枚数以上あるか
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { createSimpleConditionChecker } from "../conditionFactory";
import { ArgValidators } from "../../shared/argValidators";

// ===========================
// 純粋関数（private）
// ===========================

/** 墓地に魔法カードが指定枚数以上あるか */
const graveyardHasSpell = (graveyard: readonly CardInstance[], minCount: number): boolean =>
  graveyard.filter((card) => card.type === "spell").length >= minCount;

/** 墓地にモンスターカードが指定枚数以上あるか */
const graveyardHasMonster = (
  graveyard: readonly CardInstance[],
  minCount: number,
  frameType: string | undefined,
): boolean => {
  let monsters = graveyard.filter((card) => card.type === "monster");
  if (frameType) {
    monsters = monsters.filter((card) => card.frameType === frameType);
  }
  return monsters.length >= minCount;
};

/** 墓地に魔法・罠カードが指定枚数以上あるか */
const graveyardHasSpellOrTrap = (graveyard: readonly CardInstance[], minCount: number): boolean =>
  graveyard.filter((card) => card.type === "spell" || card.type === "trap").length >= minCount;

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * GRAVEYARD_HAS_SPELL - 墓地に魔法カードが指定枚数以上あるか
 * args: { minCount?: number } (デフォルト: 1)
 */
export const graveyardHasSpellCondition = createSimpleConditionChecker(
  (args) => ({ minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1 }),
  (state, { minCount }) => graveyardHasSpell(state.space.graveyard, minCount),
);

/**
 * GRAVEYARD_HAS_MONSTER - 墓地にモンスターカードが指定枚数以上あるか
 * args: { minCount?: number, frameType?: string } (デフォルト: minCount=1)
 */
export const graveyardHasMonsterCondition = createSimpleConditionChecker(
  (args) => ({
    minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1,
    frameType: ArgValidators.optionalString(args, "frameType"),
  }),
  (state, { minCount, frameType }) => graveyardHasMonster(state.space.graveyard, minCount, frameType),
);

/**
 * GRAVEYARD_HAS_SPELL_OR_TRAP - 墓地に魔法・罠カードが指定枚数以上あるか
 * args: { minCount?: number } (デフォルト: 1)
 */
export const graveyardHasSpellOrTrapCondition = createSimpleConditionChecker(
  (args) => ({ minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1 }),
  (state, { minCount }) => graveyardHasSpellOrTrap(state.space.graveyard, minCount),
);
