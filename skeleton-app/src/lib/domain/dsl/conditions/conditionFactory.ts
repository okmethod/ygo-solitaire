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
import type { DSLArgs, ArgsValidatorFn, PureConditionFn, ConditionCheckerFn } from "$lib/domain/dsl/types";
import { ArgValidationError } from "$lib/domain/dsl/types";

const { success, failure, ERROR_CODES } = GameProcessing.Validation;

/**
 * 条件チェッカーファクトリ
 *
 * 引数バリデーションと純粋なチェック関数を組み合わせて、ConditionChecker を生成する。
 */
export function createConditionChecker<TArgs>(
  validateArgsFn: ArgsValidatorFn<TArgs>,
  checkFn: PureConditionFn<TArgs>,
): ConditionCheckerFn {
  return (state: GameSnapshot, sourceInstance: CardInstance, args: DSLArgs): ValidationResult => {
    try {
      const validatedArgs = validateArgsFn(args);
      if (validatedArgs === null) {
        return failure(ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
      }
      return checkFn(state, sourceInstance, validatedArgs)
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
 * 多くの条件は sourceInstance を必要としないため、シンプルなシグネチャで定義できるようにする。
 */
export function createSimpleConditionChecker<TArgs>(
  validateArgsFn: ArgsValidatorFn<TArgs>,
  checkFn: (state: GameSnapshot, args: TArgs) => boolean,
): ConditionCheckerFn {
  return createConditionChecker(validateArgsFn, (state, _sourceInstance, args) => checkFn(state, args));
}

/**
 * カスタムエラーコード付き条件チェッカーファクトリ
 *
 * 条件不成立時に ACTIVATION_CONDITIONS_NOT_MET 以外のエラーコードを返したい場合に使用する。
 */
export function createConditionCheckerWithErrorCode<TArgs>(
  errorCode: ValidationErrorCode,
  validateArgsFn: ArgsValidatorFn<TArgs>,
  checkFn: PureConditionFn<TArgs>,
): ConditionCheckerFn {
  return (state: GameSnapshot, sourceInstance: CardInstance, args: DSLArgs): ValidationResult => {
    try {
      const validatedArgs = validateArgsFn(args);
      if (validatedArgs === null) {
        return failure(errorCode);
      }
      return checkFn(state, sourceInstance, validatedArgs) ? success() : failure(errorCode);
    } catch (error) {
      if (error instanceof ArgValidationError) {
        return failure(errorCode);
      }
      throw error;
    }
  };
}
