/**
 * ConditionRegistry - DSL条件名から条件チェック関数へのマッピング
 *
 * DSLの "conditions" セクションで使用する条件チェック関数を管理する。
 * レジストリパターンにより、新規条件の追加が容易。
 *
 * @module domain/dsl/registries/ConditionRegistry
 */

import type { CardInstance, CounterType } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/**
 * 条件チェック関数の型
 *
 * ゲーム状態とカードインスタンスから条件の成否を判定する。
 */
export type ConditionChecker = (
  state: GameSnapshot,
  sourceInstance: CardInstance,
  args: Readonly<Record<string, unknown>>,
) => ValidationResult;

/**
 * 登録済み条件のレジストリ
 */
const registeredConditions: Record<string, ConditionChecker> = {
  /**
   * CAN_DRAW - デッキに指定枚数以上のカードがあるか
   * args: { count: number }
   */
  CAN_DRAW: (state, _sourceInstance, args) => {
    const count = args.count as number;
    if (typeof count !== "number" || count < 1) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
    }

    if (state.space.mainDeck.length >= count) {
      return GameProcessing.Validation.success();
    }

    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  },

  /**
   * HAND_COUNT_EXCLUDING_SELF - 自身を除く手札が指定枚数以上あるか
   * args: { minCount: number }
   */
  HAND_COUNT_EXCLUDING_SELF: (state, sourceInstance, args) => {
    const minCount = args.minCount as number;
    if (typeof minCount !== "number" || minCount < 1) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
    }

    const handCountExcludingSelf = GameState.Space.countHandExcludingSelf(state.space, sourceInstance);
    if (handCountExcludingSelf >= minCount) {
      return GameProcessing.Validation.success();
    }

    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  },

  /**
   * GRAVEYARD_HAS_SPELL - 墓地に魔法カードが指定枚数以上あるか
   * args: { minCount?: number } (デフォルト: 1)
   */
  GRAVEYARD_HAS_SPELL: (state, _sourceInstance, args) => {
    const minCount = (args.minCount as number) ?? 1;

    const spellCardsInGraveyard = state.space.graveyard.filter((card) => card.type === "spell");
    if (spellCardsInGraveyard.length >= minCount) {
      return GameProcessing.Validation.success();
    }

    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  },

  /**
   * DECK_HAS_CARD - デッキに条件に合うカードが指定枚数以上あるか
   * args: { filterType: string, filterSpellType?: string, minCount?: number }
   */
  DECK_HAS_CARD: (state, _sourceInstance, args) => {
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
  },

  /**
   * HAS_COUNTER - 発動元カードに指定タイプのカウンターが指定枚数以上あるか
   * args: { counterType: CounterType, minCount: number }
   */
  HAS_COUNTER: (_state, sourceInstance, args) => {
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
  },
};

/**
 * 条件名から条件をチェックする
 *
 * @param conditionName - DSLの条件名
 * @param state - 現在のゲーム状態
 * @param sourceInstance - 発動元カードインスタンス
 * @param args - 条件に渡す引数
 * @returns バリデーション結果
 * @throws Error - 未登録の条件名の場合
 */
export function checkCondition(
  conditionName: string,
  state: GameSnapshot,
  sourceInstance: CardInstance,
  args: Readonly<Record<string, unknown>> = {},
): ValidationResult {
  const checker = registeredConditions[conditionName];
  if (!checker) {
    throw new Error(
      `Unknown condition "${conditionName}" for card ${sourceInstance.id}. Available conditions: ${Object.keys(registeredConditions).join(", ")}`,
    );
  }
  return checker(state, sourceInstance, args);
}

/**
 * 登録されている条件名一覧を取得する
 */
export function getRegisteredConditionNames(): readonly string[] {
  return Object.keys(registeredConditions);
}

/**
 * 条件が登録されているかチェックする
 */
export function isConditionRegistered(conditionName: string): boolean {
  return conditionName in registeredConditions;
}

/**
 * 新しい条件を登録する（拡張用）
 *
 * @param conditionName - 条件名
 * @param checker - 条件チェック関数
 */
export function registerCondition(conditionName: string, checker: ConditionChecker): void {
  if (registeredConditions[conditionName]) {
    throw new Error(`Condition "${conditionName}" is already registered`);
  }
  registeredConditions[conditionName] = checker;
}
