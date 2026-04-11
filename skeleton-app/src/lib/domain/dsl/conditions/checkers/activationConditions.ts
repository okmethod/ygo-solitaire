/**
 * activationConditions.ts - 発動条件関連の条件チェック
 *
 * ConditionChecker:
 * - oncePerTurnCondition: このカードがこのターンまだ発動されていないか
 * - oncePerTurnEffectCondition: この効果がこのターンまだ発動されていないか（フィールド上のカード用）
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Effect } from "$lib/domain/models/Effect";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { createConditionChecker } from "../conditionFactory";

// ===========================
// 純粋関数（private）
// ===========================

/** このカードがこのターンまだ発動されていないか */
const isOncePerTurnAvailable = (activatedCardIds: readonly number[], cardId: number): boolean =>
  !activatedCardIds.includes(cardId);

/** この効果がこのターンまだ発動されていないか（フィールド上のカード用） */
const isOncePerTurnEffectAvailable = (sourceInstance: CardInstance, effectIndex: number): boolean => {
  const effectId = Effect.Id.create("ignition", sourceInstance.id, effectIndex);
  return !sourceInstance.stateOnField?.activatedEffects?.includes(effectId);
};

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * ONCE_PER_TURN - このカードがこのターンまだ発動されていないか
 * args: { cardId?: number } (省略時はsourceInstanceのIDを使用)
 */
export const oncePerTurnCondition = createConditionChecker(
  (args) => ({ cardId: ArgValidators.optionalPositiveInt(args, "cardId") }),
  (state, sourceInstance, { cardId }) => {
    const targetCardId = cardId ?? sourceInstance.id;
    return isOncePerTurnAvailable(state.activatedCardIds, targetCardId);
  },
);

/**
 * ONCE_PER_TURN_EFFECT - この効果がこのターンまだ発動されていないか（フィールド上のカード用）
 * args: { effectIndex: number } (同一カードの起動効果の番号、1始まり)
 */
export const oncePerTurnEffectCondition = createConditionChecker(
  (args) => ({ effectIndex: ArgValidators.positiveInt(args, "effectIndex") }),
  (_state, sourceInstance, { effectIndex }) => isOncePerTurnEffectAvailable(sourceInstance, effectIndex),
);
