/**
 * ActionOverrideRegistry - Override名からOverrideHandlerファクトリへのマッピング
 *
 * DSL の "effectAdditionalRules.unclassified" セクションで使用する
 * Override ハンドラを管理する。
 *
 * @module domain/dsl/overrides/ActionOverrideRegistry
 */

import type { ActionOverrideHandler, OverrideHandlerFactoryFn } from "$lib/domain/dsl/types";
import type { OverrideName } from "./OverrideNames";

/**
 * ActionOverrideRegistry - 処理置換のレジストリ（クラス）
 *
 * Override名をキーとしてOverrideHandlerを管理する。
 * Registry Pattern により、処理置換を一元管理する。
 */
export class ActionOverrideRegistry {
  private static handlers = new Map<OverrideName, OverrideHandlerFactoryFn>();

  // ===========================
  // 登録API
  // ===========================

  /**
   * 新しいOverrideハンドラファクトリを登録する
   *
   * @param overrideName - Override 名
   * @param factory - ハンドラファクトリ関数
   * @throws Error 既に登録済みの場合
   */
  static register(overrideName: OverrideName, factory: OverrideHandlerFactoryFn): void {
    if (this.handlers.has(overrideName)) {
      throw new Error(`Override "${overrideName}" is already registered`);
    }
    this.handlers.set(overrideName, factory);
  }

  // ===========================
  // 取得API
  // ===========================

  /**
   * Override名からActionOverrideHandlerを生成する
   *
   * @param overrideName - Override 名
   * @param cardId - カード ID
   * @returns 生成されたActionOverrideHandler
   * @throws Error - 未登録のOverride名の場合
   */
  static create(overrideName: OverrideName, cardId: number): ActionOverrideHandler {
    const factory = this.handlers.get(overrideName);
    if (!factory) {
      throw new Error(
        `Unknown override "${overrideName}". Available overrides: ${this.getRegisteredNames().join(", ")}`,
      );
    }
    return factory(cardId);
  }

  /**
   * Override が登録されているかチェックする
   */
  static isRegistered(overrideName: OverrideName): boolean {
    return this.handlers.has(overrideName);
  }

  /**
   * 登録済み Override 名の一覧を取得する
   */
  static getRegisteredNames(): readonly OverrideName[] {
    return Array.from(this.handlers.keys());
  }

  // ===========================
  // ユーティリティAPI
  // ===========================

  /**
   * レジストリをクリア（テスト用）
   */
  static clear(): void {
    this.handlers.clear();
  }
}
