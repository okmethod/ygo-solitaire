/**
 * AtomicStepRegistry - ステップ名からAtomicStepビルダーへのマッピング
 *
 * 登録済みのステップ名を既存のAtomicStepビルダー関数に変換する。
 * レジストリパターンにより、新規ステップの追加が容易。
 *
 * NOTE: ステップの登録は index.ts で行う。
 *
 * @module domain/effects/steps/AtomicStepRegistry
 */

import type { AtomicStep } from "$lib/domain/models/GameProcessing";
import type { StepBuildContext, StepBuilderFn } from "$lib/domain/dsl/types";
import type { StepName } from "./StepNames";

/**
 * AtomicStepRegistry - ステップのレジストリ（クラス）
 *
 * ステップ名をキーとしてStepBuilderを管理する。
 * Registry Pattern により、ステップを一元管理する。
 */
export class AtomicStepRegistry {
  /** 登録済みステップのマップ (Step Name → StepBuilder) */
  private static steps = new Map<StepName, StepBuilderFn>();

  // ===========================
  // 登録API
  // ===========================

  /**
   * 新しいステップを登録する
   *
   * @param stepName - ステップ名
   * @param builder - ステップビルダー関数
   * @throws Error - 既に登録済みの場合
   */
  static register(stepName: StepName, builder: StepBuilderFn): void {
    if (this.steps.has(stepName)) {
      throw new Error(`Step "${stepName}" is already registered`);
    }
    this.steps.set(stepName, builder);
  }

  // ===========================
  // 取得API
  // ===========================

  /**
   * ステップ名からAtomicStepを生成する
   *
   * @param stepName - 登録済みのステップ名
   * @param args - ステップに渡す引数
   * @param context - ステップビルドコンテキスト
   * @returns 生成されたAtomicStep
   * @throws Error - 未登録のステップ名の場合
   */
  static build(
    stepName: StepName,
    args: Readonly<Record<string, unknown>> = {},
    context: StepBuildContext,
  ): AtomicStep {
    const builder = this.steps.get(stepName);
    if (!builder) {
      throw new Error(
        `Unknown step "${stepName}" in card ${context.cardId}. Available steps: ${Array.from(this.steps.keys()).join(", ")}`,
      );
    }
    return builder(args, context);
  }

  /**
   * ステップが登録されているかチェックする
   */
  static isRegistered(stepName: StepName): boolean {
    return this.steps.has(stepName);
  }

  /**
   * 登録されているステップ名一覧を取得する
   */
  static getRegisteredNames(): readonly StepName[] {
    return Array.from(this.steps.keys()) as StepName[];
  }

  // ===========================
  // ユーティリティAPI
  // ===========================

  /** レジストリをクリアする（テスト用） */
  static clear(): void {
    this.steps.clear();
  }
}
