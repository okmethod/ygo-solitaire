/**
 * CommonTypes - DSL全体で共通利用される基本型定義
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import type { EffectId } from "$lib/domain/models/Effect";

/**
 * DSL引数の汎用型
 *
 * ステップビルダーや条件チェッカーに渡される引数の基本型。
 */
export type DSLArgs = Readonly<Record<string, unknown>>;

/**
 * 引数バリデーション関数の型
 *
 * バリデーション成功時は型付き引数を返し、失敗時は null を返す。
 * ArgValidationError をスローしても良い。
 *
 * @typeParam TArgs - バリデーション済み引数の型
 */
export type ArgsValidatorFn<TArgs> = (args: DSLArgs) => TArgs | null;

/**
 * 条件チェック純粋関数の型（引数バリデーション済み）
 *
 * @typeParam TArgs - バリデーション済み引数の型
 */
export type PureConditionFn<TArgs> = (state: GameSnapshot, sourceInstance: CardInstance, args: TArgs) => boolean;

/**
 * 条件チェッカー関数の型
 *
 * ゲーム状態とカードインスタンスから条件の成否を判定する。
 */
export type ConditionCheckerFn = (state: GameSnapshot, sourceInstance: CardInstance, args: DSLArgs) => ValidationResult;

/**
 * ステップビルドコンテキスト
 *
 * ステップ生成時に必要なコンテキスト情報。
 */
export interface StepBuildContext {
  /** カードID */
  readonly cardId: number;
  /** 効果ID（オプション） - EffectActivationContext へのアクセスに使用 */
  readonly effectId?: EffectId;
  /** 発動元カードインスタンスID（オプション） */
  readonly sourceInstanceId?: string;
}

/**
 * ステップビルダー関数の型
 *
 * 引数とコンテキストからAtomicStepを生成する。
 */
export type StepBuilderFn = (args: DSLArgs, context: StepBuildContext) => AtomicStep;
