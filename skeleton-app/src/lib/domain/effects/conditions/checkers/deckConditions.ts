/**
 * deckConditions.ts - デッキ関連の条件チェック
 *
 * ConditionChecker:
 * - canDrawCondition: デッキに指定枚数以上のカードがあるか
 * - deckHasCardCondition: デッキに条件に合うカードが指定枚数以上あるか
 * - deckHasNameIncludesCondition: デッキに名前パターンを含むカードが指定枚数以上あるか
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { createSimpleConditionChecker } from "../conditionFactory";
import { ArgValidators } from "../../shared/argValidators";

// ===========================
// 純粋関数（private）
// ===========================

/** デッキに指定枚数以上のカードがあるか */
const canDraw = (deck: readonly CardInstance[], count: number): boolean => deck.length >= count;

/** デッキに条件に合うカードが指定枚数以上あるか */
const deckHasCard = (
  deck: readonly CardInstance[],
  filterType: string,
  filterSpellType: string | undefined,
  minCount: number,
): boolean => {
  const filter = (card: CardInstance): boolean => {
    if (card.type !== filterType) return false;
    if (filterSpellType && card.spellType !== filterSpellType) return false;
    return true;
  };
  return deck.filter(filter).length >= minCount;
};

/** デッキに名前パターンを含むカードが指定枚数以上あるか */
const deckHasNameIncludes = (deck: readonly CardInstance[], namePattern: string, minCount: number): boolean =>
  deck.filter((card) => card.jaName.includes(namePattern)).length >= minCount;

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * CAN_DRAW - デッキに指定枚数以上のカードがあるか
 * args: { count: number }
 */
export const canDrawCondition = createSimpleConditionChecker(
  (args) => ({ count: ArgValidators.positiveInt(args, "count") }),
  (state, { count }) => canDraw(state.space.mainDeck, count),
);

/**
 * DECK_HAS_CARD - デッキに条件に合うカードが指定枚数以上あるか
 * args: { filterType: string, filterSpellType?: string, minCount?: number }
 */
export const deckHasCardCondition = createSimpleConditionChecker(
  (args) => ({
    filterType: ArgValidators.nonEmptyString(args, "filterType"),
    filterSpellType: ArgValidators.optionalString(args, "filterSpellType"),
    minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1,
  }),
  (state, { filterType, filterSpellType, minCount }) =>
    deckHasCard(state.space.mainDeck, filterType, filterSpellType, minCount),
);

/**
 * DECK_HAS_NAME_INCLUDES - デッキに名前パターンを含むカードが指定枚数以上あるか
 * args: { namePattern: string, minCount?: number }
 */
export const deckHasNameIncludesCondition = createSimpleConditionChecker(
  (args) => ({
    namePattern: ArgValidators.nonEmptyString(args, "namePattern"),
    minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1,
  }),
  (state, { namePattern, minCount }) => deckHasNameIncludes(state.space.mainDeck, namePattern, minCount),
);
