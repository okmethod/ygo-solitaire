/**
 * ChainableActionRegistry - チェーン可能な処理のレジストリ
 *
 * Card ID → ChainableAction のマッピングを管理
 * Registry Pattern + Strategy Pattern
 * - O(1) 高速ルックアップ（Map使用）
 * - 効果の登録・取得をシンプルに
 *
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../models/ChainableAction";

/**
 * ChainableActionRegistry クラス
 *
 * カードIDをキーとして ChainableAction を管理する。
 * Strategy Pattern により、カード効果を交換可能に実装する。
 */
export class ChainableActionRegistry {
  /**
   * 効果のマップ (Card ID → ChainableAction)
   * @private
   */
  private static actions = new Map<number, ChainableAction>();

  /**
   * 効果を登録
   *
   * @param cardId - カードID（Card Data ID）
   * @param action - チェーン可能な処理
   */
  static register(cardId: number, action: ChainableAction): void {
    this.actions.set(cardId, action);
  }

  /**
   * 効果を取得
   *
   * @param cardId - カードID
   * @returns ChainableAction（未登録の場合はundefined）
   */
  static get(cardId: number): ChainableAction | undefined {
    return this.actions.get(cardId);
  }

  /**
   * レジストリをクリア（テスト用）
   */
  static clear(): void {
    this.actions.clear();
  }

  /**
   * 登録済みカードIDの一覧を取得（デバッグ用）
   *
   * @returns 登録済みカードID配列
   */
  static getRegisteredCardIds(): number[] {
    return Array.from(this.actions.keys());
  }
}
