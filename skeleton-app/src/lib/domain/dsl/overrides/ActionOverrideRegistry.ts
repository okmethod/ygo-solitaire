/**
 * ActionOverrideRegistry - Override名からハンドラへのマッピング
 *
 * DSL の "effectAdditionalRules.unclassified" セクションで使用する
 * Override ハンドラを管理する。
 *
 * @module domain/dsl/overrides/ActionOverrideRegistry
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { OverrideName } from "./OverrideNames";
import type { DSLArgs } from "$lib/domain/dsl/types";

/**
 * Override ハンドラの共通インターフェース
 */
export interface ActionOverrideHandler {
  /**
   * このオーバーライドが適用されるべきか判定
   *
   * @param state - 現在のゲーム状態
   * @param card - 対象カード
   * @param args - DSL で指定された引数
   * @returns 適用すべきなら true
   */
  shouldApply(state: GameSnapshot, card: CardInstance, args: DSLArgs): boolean;

  /**
   * オーバーライド結果を取得
   *
   * 戻り値の型はハンドラごとに異なる（unknown で汎用化）
   *
   * @param args - DSL で指定された引数
   * @returns オーバーライド値
   */
  getOverrideValue(args: DSLArgs): unknown;
}

/**
 * Override ハンドラファクトリ関数の型
 *
 * cardId を受け取り、そのカード専用の ActionOverrideHandler を返す。
 */
export type OverrideHandlerFactory = (cardId: number) => ActionOverrideHandler;

/**
 * ActionOverrideRegistry - Override名からハンドラファクトリへのマッピング
 *
 * Registry Pattern を採用。
 * - register: ハンドラファクトリを登録
 * - createHandler: カードID を指定してハンドラを生成
 */
export class ActionOverrideRegistry {
  private static handlers = new Map<OverrideName, OverrideHandlerFactory>();

  /**
   * Override ハンドラファクトリを登録
   *
   * @param name - Override 名
   * @param factory - ハンドラファクトリ関数
   * @throws Error 既に登録済みの場合
   */
  static register(name: OverrideName, factory: OverrideHandlerFactory): void {
    if (this.handlers.has(name)) {
      throw new Error(`Override "${name}" is already registered`);
    }
    this.handlers.set(name, factory);
  }

  /**
   * Override ハンドラを生成
   *
   * @param name - Override 名
   * @param cardId - カード ID
   * @returns 生成されたハンドラ
   * @throws Error 未登録の Override 名の場合
   */
  static createHandler(name: OverrideName, cardId: number): ActionOverrideHandler {
    const factory = this.handlers.get(name);
    if (!factory) {
      throw new Error(`Unknown override "${name}". Available overrides: ${this.getRegisteredNames().join(", ")}`);
    }
    return factory(cardId);
  }

  /**
   * Override が登録済みか確認
   */
  static isRegistered(name: OverrideName): boolean {
    return this.handlers.has(name);
  }

  /**
   * 登録済み Override 名の一覧を取得
   */
  static getRegisteredNames(): readonly OverrideName[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * レジストリをクリア（テスト用）
   */
  static clear(): void {
    this.handlers.clear();
  }
}
