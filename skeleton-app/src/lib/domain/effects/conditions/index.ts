/**
 * AtomicCondition Effect Library - 条件ライブラリ
 *
 * 条件の登録とエクスポートを行う。
 * DSLの "conditions" セクションで使用する条件チェック関数を登録する。
 *
 * @module domain/effects/conditions
 */

import type { CounterType } from "$lib/domain/models/Card";
import { Effect } from "$lib/domain/models/Effect";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

// レジストリAPI
import { AtomicConditionRegistry, type ConditionChecker } from "./AtomicConditionRegistry";

// 具体実装
import { canDraw, deckHasCard, deckHasNameIncludes } from "./deckConditions";
import { handCount, handCountExcludingSelf } from "./handConditions";
import { graveyardHasSpell, graveyardHasMonster } from "./graveyardConditions";
import { hasCounter } from "./counterConditions";
import { oncePerTurn, oncePerTurnEffect } from "./activationConditions";
import { lpAtLeast, lpGreaterThan } from "./lpConditions";

// ===========================
// エクスポート
// ===========================

export { AtomicConditionRegistry, type ConditionChecker };

// 後方互換性のためのエイリアス関数
export const checkCondition = AtomicConditionRegistry.check.bind(AtomicConditionRegistry);
export const registerCondition = AtomicConditionRegistry.register.bind(AtomicConditionRegistry);
export const isConditionRegistered = AtomicConditionRegistry.isRegistered.bind(AtomicConditionRegistry);
export const getRegisteredConditionNames = AtomicConditionRegistry.getRegisteredNames.bind(AtomicConditionRegistry);
export const clearConditionRegistry = AtomicConditionRegistry.clear.bind(AtomicConditionRegistry);

// 具体実装（直接利用する場合）
export {
  canDraw,
  deckHasCard,
  deckHasNameIncludes,
  handCount,
  handCountExcludingSelf,
  graveyardHasSpell,
  graveyardHasMonster,
  hasCounter,
  oncePerTurn,
  oncePerTurnEffect,
  lpAtLeast,
  lpGreaterThan,
};

// ===========================
// 条件登録
// ===========================

const { ERROR_CODES } = GameProcessing.Validation;

/**
 * CAN_DRAW - デッキに指定枚数以上のカードがあるか
 * args: { count: number }
 */
AtomicConditionRegistry.register("CAN_DRAW", (state, _sourceInstance, args) => {
  const count = args.count as number;
  if (typeof count !== "number" || count < 1) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  return canDraw(state, count);
});

/**
 * HAND_COUNT_EXCLUDING_SELF - 自身を除く手札が指定枚数以上あるか
 * args: { minCount: number }
 */
AtomicConditionRegistry.register("HAND_COUNT_EXCLUDING_SELF", (state, sourceInstance, args) => {
  const minCount = args.minCount as number;
  if (typeof minCount !== "number" || minCount < 1) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  return handCountExcludingSelf(state, sourceInstance, minCount);
});

/**
 * GRAVEYARD_HAS_SPELL - 墓地に魔法カードが指定枚数以上あるか
 * args: { minCount?: number } (デフォルト: 1)
 */
AtomicConditionRegistry.register("GRAVEYARD_HAS_SPELL", (state, _sourceInstance, args) => {
  const minCount = (args.minCount as number) ?? 1;
  return graveyardHasSpell(state, minCount);
});

/**
 * DECK_HAS_CARD - デッキに条件に合うカードが指定枚数以上あるか
 * args: { filterType: string, filterSpellType?: string, minCount?: number }
 */
AtomicConditionRegistry.register("DECK_HAS_CARD", (state, _sourceInstance, args) => {
  const filterType = args.filterType as string;
  const filterSpellType = args.filterSpellType as string | undefined;
  const minCount = (args.minCount as number) ?? 1;

  if (!filterType) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  const filter = (card: { type: string; spellType?: string }) => {
    if (card.type !== filterType) return false;
    if (filterSpellType && card.spellType !== filterSpellType) return false;
    return true;
  };

  return deckHasCard(state, filter, minCount);
});

/**
 * DECK_HAS_NAME_INCLUDES - デッキに名前パターンを含むカードが指定枚数以上あるか
 * args: { namePattern: string, minCount?: number }
 */
AtomicConditionRegistry.register("DECK_HAS_NAME_INCLUDES", (state, _sourceInstance, args) => {
  const namePattern = args.namePattern as string;
  const minCount = (args.minCount as number) ?? 1;

  if (!namePattern) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return deckHasNameIncludes(state, namePattern, minCount);
});

/**
 * HAND_COUNT - 手札が指定枚数以上あるか
 * args: { minCount: number }
 */
AtomicConditionRegistry.register("HAND_COUNT", (state, _sourceInstance, args) => {
  const minCount = args.minCount as number;
  if (typeof minCount !== "number" || minCount < 1) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  return handCount(state, minCount);
});

/**
 * ONCE_PER_TURN - このカードがこのターンまだ発動されていないか
 * args: { cardId: number } (省略時はsourceInstanceのIDを使用)
 */
AtomicConditionRegistry.register("ONCE_PER_TURN", (state, sourceInstance, args) => {
  const cardId = (args.cardId as number) ?? sourceInstance.id;
  return oncePerTurn(state, cardId);
});

/**
 * GRAVEYARD_HAS_MONSTER - 墓地にモンスターカードが指定枚数以上あるか
 * args: { minCount?: number, frameType?: string } (デフォルト: minCount=1)
 */
AtomicConditionRegistry.register("GRAVEYARD_HAS_MONSTER", (state, _sourceInstance, args) => {
  const minCount = (args.minCount as number) ?? 1;
  const frameType = args.frameType as string | undefined;

  const filter = frameType ? (card: { frameType?: string }) => card.frameType === frameType : undefined;

  return graveyardHasMonster(state, minCount, filter);
});

/**
 * HAS_COUNTER - 発動元カードに指定タイプのカウンターが指定枚数以上あるか
 * args: { counterType: CounterType, minCount: number }
 */
AtomicConditionRegistry.register("HAS_COUNTER", (_state, sourceInstance, args) => {
  const counterType = args.counterType as CounterType;
  const minCount = args.minCount as number;

  if (!counterType) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  if (typeof minCount !== "number" || minCount < 1) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return hasCounter(sourceInstance, counterType, minCount);
});

/**
 * LP_AT_LEAST - プレイヤーのLPが指定値以上か
 * args: { amount: number, target?: "player" | "opponent" }
 */
AtomicConditionRegistry.register("LP_AT_LEAST", (state, _sourceInstance, args) => {
  const amount = args.amount as number;
  const target = (args.target as "player" | "opponent") ?? "player";

  if (typeof amount !== "number" || amount < 0) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return lpAtLeast(state, amount, target);
});

/**
 * LP_GREATER_THAN - プレイヤーのLPが指定値を超えているか
 * args: { amount: number, target?: "player" | "opponent" }
 */
AtomicConditionRegistry.register("LP_GREATER_THAN", (state, _sourceInstance, args) => {
  const amount = args.amount as number;
  const target = (args.target as "player" | "opponent") ?? "player";

  if (typeof amount !== "number" || amount < 0) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return lpGreaterThan(state, amount, target);
});

/**
 * ONCE_PER_TURN_EFFECT - この効果がこのターンまだ発動されていないか（フィールド上のカード用）
 * args: { effectIndex: number } (同一カードの起動効果の番号、1始まり)
 */
AtomicConditionRegistry.register("ONCE_PER_TURN_EFFECT", (_state, sourceInstance, args) => {
  const effectIndex = args.effectIndex as number;

  if (typeof effectIndex !== "number" || effectIndex < 1) {
    return GameProcessing.Validation.failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  const effectId = Effect.Id.create("ignition", sourceInstance.id, effectIndex);
  return oncePerTurnEffect(sourceInstance, effectId);
});
