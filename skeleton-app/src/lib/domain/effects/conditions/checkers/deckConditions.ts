/**
 * deckConditions.ts - デッキ関連の条件チェック
 *
 * ConditionChecker:
 * - canDrawCondition: デッキに指定枚数以上のカードがあるか
 * - deckHasCardCondition: デッキに条件に合うカードが指定枚数以上あるか
 * - deckHasNameIncludesCondition: デッキに名前パターンを含むカードが指定枚数以上あるか
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ConditionChecker } from "../AtomicConditionRegistry";

const { success, failure, ERROR_CODES } = GameProcessing.Validation;

// ===========================
// 純粋関数（private）
// ===========================

/** デッキに指定枚数以上のカードがあるか */
const canDraw = (state: GameSnapshot, count: number): boolean => state.space.mainDeck.length >= count;

/** デッキに条件に合うカードが指定枚数以上あるか */
const deckHasCard = (state: GameSnapshot, filter: (card: CardInstance) => boolean, minCount: number): boolean =>
  state.space.mainDeck.filter(filter).length >= minCount;

/** デッキに名前パターンを含むカードが指定枚数以上あるか */
const deckHasNameIncludes = (state: GameSnapshot, namePattern: string, minCount: number): boolean =>
  state.space.mainDeck.filter((card) => card.jaName.includes(namePattern)).length >= minCount;

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * CAN_DRAW - デッキに指定枚数以上のカードがあるか
 * args: { count: number }
 */
export const canDrawCondition: ConditionChecker = (state, _sourceInstance, args) => {
  const count = args.count as number;
  if (typeof count !== "number" || count < 1) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  return canDraw(state, count) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/**
 * DECK_HAS_CARD - デッキに条件に合うカードが指定枚数以上あるか
 * args: { filterType: string, filterSpellType?: string, minCount?: number }
 */
export const deckHasCardCondition: ConditionChecker = (state, _sourceInstance, args) => {
  const filterType = args.filterType as string;
  const filterSpellType = args.filterSpellType as string | undefined;
  const minCount = (args.minCount as number) ?? 1;

  if (!filterType) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  const filter = (card: CardInstance): boolean => {
    if (card.type !== filterType) return false;
    if (filterSpellType && card.spellType !== filterSpellType) return false;
    return true;
  };

  return deckHasCard(state, filter, minCount) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/**
 * DECK_HAS_NAME_INCLUDES - デッキに名前パターンを含むカードが指定枚数以上あるか
 * args: { namePattern: string, minCount?: number }
 */
export const deckHasNameIncludesCondition: ConditionChecker = (state, _sourceInstance, args) => {
  const namePattern = args.namePattern as string;
  const minCount = (args.minCount as number) ?? 1;

  if (!namePattern) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return deckHasNameIncludes(state, namePattern, minCount)
    ? success()
    : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};
