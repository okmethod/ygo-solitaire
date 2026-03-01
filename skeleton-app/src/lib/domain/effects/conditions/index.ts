/**
 * AtomicCondition Effect Library - 条件ライブラリ
 *
 * 条件の登録とエクスポートを行う。
 * DSLの "conditions" セクションで使用する条件チェック関数を登録する。
 *
 * @module domain/effects/conditions
 */

import type { CounterType } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import { GameState } from "$lib/domain/models/GameState";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

// レジストリAPI
import { AtomicConditionRegistry, type ConditionChecker } from "./AtomicConditionRegistry";

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

// ===========================
// 条件登録
// ===========================

/**
 * CAN_DRAW - デッキに指定枚数以上のカードがあるか
 * args: { count: number }
 */
AtomicConditionRegistry.register("CAN_DRAW", (state, _sourceInstance, args) => {
  const count = args.count as number;
  if (typeof count !== "number" || count < 1) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  if (state.space.mainDeck.length >= count) {
    return GameProcessing.Validation.success();
  }

  return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
});

/**
 * HAND_COUNT_EXCLUDING_SELF - 自身を除く手札が指定枚数以上あるか
 * args: { minCount: number }
 */
AtomicConditionRegistry.register("HAND_COUNT_EXCLUDING_SELF", (state, sourceInstance, args) => {
  const minCount = args.minCount as number;
  if (typeof minCount !== "number" || minCount < 1) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  const handCountExcludingSelf = GameState.Space.countHandExcludingSelf(state.space, sourceInstance);
  if (handCountExcludingSelf >= minCount) {
    return GameProcessing.Validation.success();
  }

  return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
});

/**
 * GRAVEYARD_HAS_SPELL - 墓地に魔法カードが指定枚数以上あるか
 * args: { minCount?: number } (デフォルト: 1)
 */
AtomicConditionRegistry.register("GRAVEYARD_HAS_SPELL", (state, _sourceInstance, args) => {
  const minCount = (args.minCount as number) ?? 1;

  const spellCardsInGraveyard = state.space.graveyard.filter((card) => card.type === "spell");
  if (spellCardsInGraveyard.length >= minCount) {
    return GameProcessing.Validation.success();
  }

  return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
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
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  const matchingCards = state.space.mainDeck.filter((card) => {
    if (card.type !== filterType) return false;
    if (filterSpellType && card.spellType !== filterSpellType) return false;
    return true;
  });

  if (matchingCards.length >= minCount) {
    return GameProcessing.Validation.success();
  }

  return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
});

/**
 * HAND_COUNT - 手札が指定枚数以上あるか
 * args: { minCount: number }
 */
AtomicConditionRegistry.register("HAND_COUNT", (state, _sourceInstance, args) => {
  const minCount = args.minCount as number;
  if (typeof minCount !== "number" || minCount < 1) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  if (state.space.hand.length >= minCount) {
    return GameProcessing.Validation.success();
  }

  return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
});

/**
 * ONCE_PER_TURN - このカードがこのターンまだ発動されていないか
 * args: { cardId: number } (省略時はsourceInstanceのIDを使用)
 */
AtomicConditionRegistry.register("ONCE_PER_TURN", (state, sourceInstance, args) => {
  const cardId = (args.cardId as number) ?? sourceInstance.id;

  if (state.activatedCardIds.has(cardId)) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  return GameProcessing.Validation.success();
});

/**
 * GRAVEYARD_HAS_MONSTER - 墓地にモンスターカードが指定枚数以上あるか
 * args: { minCount?: number, frameType?: string } (デフォルト: minCount=1)
 */
AtomicConditionRegistry.register("GRAVEYARD_HAS_MONSTER", (state, _sourceInstance, args) => {
  const minCount = (args.minCount as number) ?? 1;
  const frameType = args.frameType as string | undefined;

  const monstersInGraveyard = state.space.graveyard.filter((card) => {
    if (card.type !== "monster") return false;
    if (frameType && card.frameType !== frameType) return false;
    return true;
  });

  if (monstersInGraveyard.length >= minCount) {
    return GameProcessing.Validation.success();
  }

  return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
});

/**
 * HAS_COUNTER - 発動元カードに指定タイプのカウンターが指定枚数以上あるか
 * args: { counterType: CounterType, minCount: number }
 */
AtomicConditionRegistry.register("HAS_COUNTER", (_state, sourceInstance, args) => {
  const counterType = args.counterType as CounterType;
  const minCount = args.minCount as number;

  if (!counterType) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }
  if (typeof minCount !== "number" || minCount < 1) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  // フィールド上のカードでない場合はカウンターを持てない
  const counters = sourceInstance.stateOnField?.counters ?? [];
  const currentCount = Card.Counter.get(counters, counterType);

  if (currentCount >= minCount) {
    return GameProcessing.Validation.success();
  }

  return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.INSUFFICIENT_COUNTERS);
});
