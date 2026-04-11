/**
 * deckConditions.ts - デッキ関連の条件チェック
 *
 * ConditionChecker:
 * - canDrawCondition: デッキに指定枚数以上のカードがあるか
 * - deckHasCardCondition: デッキに条件に合うカードが指定枚数以上あるか
 * - deckHasNameIncludesCondition: デッキに名前パターンを含むカードが指定枚数以上あるか
 */

import type { CardType, SpellSubType } from "$lib/domain/models/Card";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { createSimpleConditionChecker } from "../conditionFactory";
import {
  hasAtLeast,
  countMatching,
  byType,
  bySpellType,
  byNameIncludes,
  byFrameType,
  byLevel,
  and,
  isSpellOrTrap,
} from "../primitives/cardPredicates";

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * CAN_DRAW - デッキに指定枚数以上のカードがあるか
 * args: { count: number }
 */
export const canDrawCondition = createSimpleConditionChecker(
  (args) => ({ count: ArgValidators.positiveInt(args, "count") }),
  (state, { count }) => state.space.mainDeck.length >= count,
);

/**
 * DECK_HAS_CARD - デッキに条件に合うカードが指定枚数以上あるか
 * args: { filterType: string, filterSpellType?: string, minCount?: number }
 */
export const deckHasCardCondition = createSimpleConditionChecker(
  (args) => ({
    filterType: ArgValidators.nonEmptyString(args, "filterType") as CardType,
    filterSpellType: ArgValidators.optionalString(args, "filterSpellType") as SpellSubType | undefined,
    minCount: ArgValidators.optionalPositiveInt(args, "minCount") ?? 1,
  }),
  (state, { filterType, filterSpellType, minCount }) => {
    const predicate = filterSpellType ? and(byType(filterType), bySpellType(filterSpellType)) : byType(filterType);
    return hasAtLeast(state.space.mainDeck, predicate, minCount);
  },
);

/**
 * DECK_HAS_NORMAL_MONSTER_FOR_GRAVEYARD_BANISH - デッキに墓地の魔法・罠枚数に対応するレベルの通常モンスターが存在するか
 * 墓地の魔法・罠カード枚数（maxCountで上限）の各レベル(1〜N)について、デッキに通常モンスターが1体以上いるか確認する
 * args: { maxCount: number }
 */
export const deckHasNormalMonsterForGraveyardBanishCondition = createSimpleConditionChecker(
  (args) => ({ maxCount: ArgValidators.positiveInt(args, "maxCount") }),
  (state, { maxCount }) => {
    const graveyardSpellOrTrapCount = countMatching(state.space.graveyard, isSpellOrTrap);
    const maxLevel = Math.min(maxCount, graveyardSpellOrTrapCount);
    const isNormalMonster = and(byType("monster"), byFrameType("normal"));
    for (let level = 1; level <= maxLevel; level++) {
      if (hasAtLeast(state.space.mainDeck, and(isNormalMonster, byLevel(level)), 1)) {
        return true;
      }
    }
    return false;
  },
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
  (state, { namePattern, minCount }) => hasAtLeast(state.space.mainDeck, byNameIncludes(namePattern), minCount),
);
