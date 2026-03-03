/**
 * graveyardConditions.ts - 墓地関連の条件チェック
 *
 * ConditionChecker:
 * - graveyardHasSpellCondition: 墓地に魔法カードが指定枚数以上あるか
 * - graveyardHasMonsterCondition: 墓地にモンスターカードが指定枚数以上あるか
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ConditionChecker } from "../AtomicConditionRegistry";

const { success, failure, ERROR_CODES } = GameProcessing.Validation;

// ===========================
// 純粋関数（private）
// ===========================

/** 墓地に魔法カードが指定枚数以上あるか */
const graveyardHasSpell = (state: GameSnapshot, minCount: number): boolean =>
  state.space.graveyard.filter((card) => card.type === "spell").length >= minCount;

/** 墓地にモンスターカードが指定枚数以上あるか */
const graveyardHasMonster = (
  state: GameSnapshot,
  minCount: number,
  filter?: (card: CardInstance) => boolean,
): boolean => {
  let monsters = state.space.graveyard.filter((card) => card.type === "monster");
  if (filter) {
    monsters = monsters.filter(filter);
  }
  return monsters.length >= minCount;
};

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * GRAVEYARD_HAS_SPELL - 墓地に魔法カードが指定枚数以上あるか
 * args: { minCount?: number } (デフォルト: 1)
 */
export const graveyardHasSpellCondition: ConditionChecker = (state, _sourceInstance, args) => {
  const minCount = (args.minCount as number) ?? 1;
  return graveyardHasSpell(state, minCount) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/**
 * GRAVEYARD_HAS_MONSTER - 墓地にモンスターカードが指定枚数以上あるか
 * args: { minCount?: number, frameType?: string } (デフォルト: minCount=1)
 */
export const graveyardHasMonsterCondition: ConditionChecker = (state, _sourceInstance, args) => {
  const minCount = (args.minCount as number) ?? 1;
  const frameType = args.frameType as string | undefined;

  const filter = frameType ? (card: CardInstance) => card.frameType === frameType : undefined;

  return graveyardHasMonster(state, minCount, filter) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};
