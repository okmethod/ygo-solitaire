/**
 * activationConditions.ts - 発動条件関連の条件チェック
 *
 * ConditionChecker:
 * - oncePerTurnCondition: このカードがこのターンまだ発動されていないか
 * - oncePerTurnEffectCondition: この効果がこのターンまだ発動されていないか（フィールド上のカード用）
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { EffectId } from "$lib/domain/models/Effect";
import { Effect } from "$lib/domain/models/Effect";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ConditionChecker } from "../AtomicConditionRegistry";

const { success, failure, ERROR_CODES } = GameProcessing.Validation;

// ===========================
// 純粋関数（private）
// ===========================

/** このカードがこのターンまだ発動されていないか */
const oncePerTurn = (state: GameSnapshot, cardId: number): boolean => !state.activatedCardIds.has(cardId);

/** この効果がこのターンまだ発動されていないか（フィールド上のカード用） */
const oncePerTurnEffect = (sourceInstance: CardInstance, effectId: EffectId): boolean =>
  !sourceInstance.stateOnField?.activatedEffects?.has(effectId);

// ===========================
// ConditionChecker（export）
// ===========================

/**
 * ONCE_PER_TURN - このカードがこのターンまだ発動されていないか
 * args: { cardId: number } (省略時はsourceInstanceのIDを使用)
 */
export const oncePerTurnCondition: ConditionChecker = (state, sourceInstance, args) => {
  const cardId = (args.cardId as number) ?? sourceInstance.id;
  return oncePerTurn(state, cardId) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};

/**
 * ONCE_PER_TURN_EFFECT - この効果がこのターンまだ発動されていないか（フィールド上のカード用）
 * args: { effectIndex: number } (同一カードの起動効果の番号、1始まり)
 */
export const oncePerTurnEffectCondition: ConditionChecker = (_state, sourceInstance, args) => {
  const effectIndex = args.effectIndex as number;

  if (typeof effectIndex !== "number" || effectIndex < 1) {
    return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  const effectId = Effect.Id.create("ignition", sourceInstance.id, effectIndex);
  return oncePerTurnEffect(sourceInstance, effectId) ? success() : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
};
