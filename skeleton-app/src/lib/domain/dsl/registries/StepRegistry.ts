/**
 * StepRegistry - DSLステップ名からAtomicStepビルダーへのマッピング
 *
 * DSLの "step" キーワードを既存のAtomicStepビルダー関数に変換する。
 * レジストリパターンにより、新規ステップの追加が容易。
 *
 * @module domain/dsl/registries/StepRegistry
 */

import type { AtomicStep } from "$lib/domain/models/GameProcessing";
import type { Player } from "$lib/domain/models/GameState";
import { drawStep, fillHandsStep } from "$lib/domain/effects/steps/draws";
import { selectAndDiscardStep } from "$lib/domain/effects/steps/discards";
import { markThenStep } from "$lib/domain/effects/steps/timing";
import { gainLpStep } from "$lib/domain/effects/steps/lifePoints";

/**
 * ステップビルドコンテキスト
 *
 * ステップ生成時に必要なコンテキスト情報。
 */
export interface StepBuildContext {
  /** カードID */
  readonly cardId: number;
  /** 発動元カードインスタンスID（オプション） */
  readonly sourceInstanceId?: string;
}

/**
 * ステップビルダー関数の型
 *
 * DSL定義のargsとコンテキストからAtomicStepを生成する。
 */
export type StepBuilder = (args: Readonly<Record<string, unknown>>, context: StepBuildContext) => AtomicStep;

/**
 * 登録済みステップのレジストリ
 */
const registeredSteps: Record<string, StepBuilder> = {
  /**
   * DRAW - 指定枚数ドロー
   * args: { count: number }
   */
  DRAW: (args) => {
    const count = args.count as number;
    if (typeof count !== "number" || count < 1) {
      throw new Error("DRAW step requires a positive count argument");
    }
    return drawStep(count);
  },

  /**
   * SELECT_AND_DISCARD - 手札から指定枚数を選択して捨てる
   * args: { count: number, cancelable?: boolean }
   */
  SELECT_AND_DISCARD: (args) => {
    const count = args.count as number;
    const cancelable = args.cancelable as boolean | undefined;
    if (typeof count !== "number" || count < 1) {
      throw new Error("SELECT_AND_DISCARD step requires a positive count argument");
    }
    return selectAndDiscardStep(count, cancelable);
  },

  /**
   * FILL_HANDS - 手札が指定枚数になるまでドロー
   * args: { count: number }
   */
  FILL_HANDS: (args) => {
    const count = args.count as number;
    if (typeof count !== "number" || count < 1) {
      throw new Error("FILL_HANDS step requires a positive count argument");
    }
    return fillHandsStep(count);
  },

  /**
   * THEN - タイミング進行マーカー（「その後」）
   * args: なし
   */
  THEN: () => markThenStep(),

  /**
   * GAIN_LP - LP回復
   * args: { amount: number, target: "player" | "opponent" }
   */
  GAIN_LP: (args) => {
    const amount = args.amount as number;
    const target = (args.target as Player) ?? "player";
    if (typeof amount !== "number" || amount < 1) {
      throw new Error("GAIN_LP step requires a positive amount argument");
    }
    if (target !== "player" && target !== "opponent") {
      throw new Error('GAIN_LP step requires target to be "player" or "opponent"');
    }
    return gainLpStep(amount, target);
  },
};

/**
 * ステップ名からAtomicStepを生成する
 *
 * @param stepName - DSLのステップ名
 * @param args - ステップに渡す引数
 * @param context - ステップビルドコンテキスト
 * @returns 生成されたAtomicStep
 * @throws Error - 未登録のステップ名の場合
 */
export function buildStep(
  stepName: string,
  args: Readonly<Record<string, unknown>> = {},
  context: StepBuildContext,
): AtomicStep {
  const builder = registeredSteps[stepName];
  if (!builder) {
    throw new Error(
      `Unknown step "${stepName}" in card ${context.cardId}. Available steps: ${Object.keys(registeredSteps).join(", ")}`,
    );
  }
  return builder(args, context);
}

/**
 * 登録されているステップ名一覧を取得する
 */
export function getRegisteredStepNames(): readonly string[] {
  return Object.keys(registeredSteps);
}

/**
 * ステップが登録されているかチェックする
 */
export function isStepRegistered(stepName: string): boolean {
  return stepName in registeredSteps;
}

/**
 * 新しいステップを登録する（拡張用）
 *
 * @param stepName - ステップ名
 * @param builder - ステップビルダー関数
 */
export function registerStep(stepName: string, builder: StepBuilder): void {
  if (registeredSteps[stepName]) {
    throw new Error(`Step "${stepName}" is already registered`);
  }
  registeredSteps[stepName] = builder;
}
