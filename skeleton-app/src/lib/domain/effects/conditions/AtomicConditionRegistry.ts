/**
 * AtomicConditionRegistry - 条件名から条件チェック関数へのマッピング
 *
 * DSLの "conditions" セクションで使用する条件チェック関数を管理する。
 * レジストリパターンにより、新規条件の追加が容易。
 *
 * NOTE: 条件の登録は index.ts で行う。
 *
 * @module domain/effects/conditions/AtomicConditionRegistry
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";

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
 * AtomicConditionRegistry - 条件のレジストリ（クラス）
 *
 * 条件名をキーとしてConditionCheckerを管理する。
 * Registry Pattern により、条件を一元管理する。
 */
export class AtomicConditionRegistry {
  /** 登録済み条件のマップ (Condition Name → ConditionChecker) */
  private static conditions = new Map<string, ConditionChecker>();

  // ===========================
  // 登録API
  // ===========================

  /**
   * 新しい条件を登録する
   *
   * @param conditionName - 条件名
   * @param checker - 条件チェック関数
   * @throws Error - 既に登録済みの場合
   */
  static register(conditionName: string, checker: ConditionChecker): void {
    if (this.conditions.has(conditionName)) {
      throw new Error(`Condition "${conditionName}" is already registered`);
    }
    this.conditions.set(conditionName, checker);
  }

  // ===========================
  // 取得API
  // ===========================

  /**
   * 条件名から条件をチェックする
   *
   * @param conditionName - 登録済みの条件名
   * @param state - 現在のゲーム状態
   * @param sourceInstance - 発動元カードインスタンス
   * @param args - 条件に渡す引数
   * @returns バリデーション結果
   * @throws Error - 未登録の条件名の場合
   */
  static check(
    conditionName: string,
    state: GameSnapshot,
    sourceInstance: CardInstance,
    args: Readonly<Record<string, unknown>> = {},
  ): ValidationResult {
    const checker = this.conditions.get(conditionName);
    if (!checker) {
      throw new Error(
        `Unknown condition "${conditionName}" for card ${sourceInstance.id}. Available conditions: ${Array.from(this.conditions.keys()).join(", ")}`,
      );
    }
    return checker(state, sourceInstance, args);
  }

  /**
   * 条件が登録されているかチェックする
   */
  static isRegistered(conditionName: string): boolean {
    return this.conditions.has(conditionName);
  }

  /**
   * 登録されている条件名一覧を取得する
   */
  static getRegisteredNames(): readonly string[] {
    return Array.from(this.conditions.keys());
  }

  // ===========================
  // ユーティリティAPI
  // ===========================

  /** レジストリをクリアする（テスト用） */
  static clear(): void {
    this.conditions.clear();
  }
}
