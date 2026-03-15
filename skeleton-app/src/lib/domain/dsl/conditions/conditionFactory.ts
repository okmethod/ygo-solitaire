/**
 * conditionFactory.ts - 条件チェッカー生成のファクトリ関数
 *
 * 条件チェッカーの共通パターンを抽象化し、ボイラープレートを削減する。
 *
 * @module domain/effects/shared/conditionFactory
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { ValidationResult, ValidationErrorCode } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { ArgValidationError } from "$lib/domain/dsl/argValidators";
import type { ConditionChecker } from "./AtomicConditionRegistry";

const { success, failure, ERROR_CODES } = GameProcessing.Validation;

type Args = Readonly<Record<string, unknown>>;

/**
 * 純粋なチェック関数の型（引数バリデーション済み）
 *
 * @typeParam TArgs - バリデーション済み引数の型
 */
export type PureConditionFn<TArgs> = (state: GameSnapshot, sourceInstance: CardInstance, args: TArgs) => boolean;

/**
 * 引数バリデーション関数の型
 *
 * バリデーション成功時は型付き引数を返し、失敗時は null を返す。
 * ArgValidationError をスローしても良い。
 *
 * @typeParam TArgs - バリデーション済み引数の型
 */
export type ArgsValidator<TArgs> = (args: Args) => TArgs | null;

/**
 * 条件チェッカーファクトリ
 *
 * 引数バリデーションと純粋なチェック関数を組み合わせて、
 * ConditionChecker を生成する。
 *
 * @example
 * ```typescript
 * // Before: 手動でボイラープレートを書く
 * export const handCountCondition: ConditionChecker = (state, _sourceInstance, args) => {
 *   const minCount = args.minCount as number;
 *   if (typeof minCount !== "number" || minCount < 1) {
 *     return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
 *   }
 *   return state.space.hand.length >= minCount
 *     ? success()
 *     : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
 * };
 *
 * // After: ファクトリで簡潔に
 * export const handCountCondition = createConditionChecker(
 *   (args) => {
 *     const minCount = ArgValidators.positiveInt(args, "minCount");
 *     return { minCount };
 *   },
 *   (state, _sourceInstance, { minCount }) => state.space.hand.length >= minCount
 * );
 * ```
 *
 * @param validateArgs - 引数バリデーション関数
 * @param check - 純粋なチェック関数
 * @returns ConditionChecker
 */
export function createConditionChecker<TArgs>(
  validateArgs: ArgsValidator<TArgs>,
  check: PureConditionFn<TArgs>,
): ConditionChecker {
  return (state: GameSnapshot, sourceInstance: CardInstance, args: Args): ValidationResult => {
    try {
      const validatedArgs = validateArgs(args);
      if (validatedArgs === null) {
        return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
      }
      return check(state, sourceInstance, validatedArgs)
        ? success()
        : failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
    } catch (error) {
      if (error instanceof ArgValidationError) {
        // バリデーションエラーは条件不成立として扱う
        return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
      }
      throw error;
    }
  };
}

/**
 * sourceInstance を使用しない条件チェッカーファクトリ
 *
 * 多くの条件は sourceInstance を必要としないため、
 * シンプルなシグネチャで定義できるようにする。
 *
 * @example
 * ```typescript
 * export const handCountCondition = createSimpleConditionChecker(
 *   (args) => ({ minCount: ArgValidators.positiveInt(args, "minCount") }),
 *   (state, { minCount }) => state.space.hand.length >= minCount
 * );
 * ```
 */
export function createSimpleConditionChecker<TArgs>(
  validateArgs: ArgsValidator<TArgs>,
  check: (state: GameSnapshot, args: TArgs) => boolean,
): ConditionChecker {
  return createConditionChecker(validateArgs, (state, _sourceInstance, args) => check(state, args));
}

/**
 * 引数なしの条件チェッカーファクトリ
 *
 * 引数を必要としない単純な条件用。
 *
 * @example
 * ```typescript
 * export const canDrawCondition = createNoArgsConditionChecker(
 *   (state) => state.space.mainDeck.length > 0
 * );
 * ```
 */
export function createNoArgsConditionChecker(
  check: (state: GameSnapshot, sourceInstance: CardInstance) => boolean,
): ConditionChecker {
  return createConditionChecker(
    () => ({}),
    (state, sourceInstance) => check(state, sourceInstance),
  );
}

/**
 * カスタムエラーコード付き条件チェッカーファクトリ
 *
 * 条件不成立時に ACTIVATION_CONDITIONS_NOT_MET 以外のエラーコードを返したい場合に使用。
 *
 * @example
 * ```typescript
 * export const hasCounterCondition = createConditionCheckerWithErrorCode(
 *   ERROR_CODES.INSUFFICIENT_COUNTERS,
 *   (args) => ({ ... }),
 *   (state, sourceInstance, args) => ...
 * );
 * ```
 */
export function createConditionCheckerWithErrorCode<TArgs>(
  errorCode: ValidationErrorCode,
  validateArgs: ArgsValidator<TArgs>,
  check: PureConditionFn<TArgs>,
): ConditionChecker {
  return (state: GameSnapshot, sourceInstance: CardInstance, args: Args): ValidationResult => {
    try {
      const validatedArgs = validateArgs(args);
      if (validatedArgs === null) {
        return failure(errorCode);
      }
      return check(state, sourceInstance, validatedArgs) ? success() : failure(errorCode);
    } catch (error) {
      if (error instanceof ArgValidationError) {
        return failure(errorCode);
      }
      throw error;
    }
  };
}
