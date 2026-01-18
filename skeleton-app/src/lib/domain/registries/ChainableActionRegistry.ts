/**
 * ChainableActionRegistry - チェーン可能な処理のレジストリ
 *
 * Card ID → ChainableAction のマッピングを管理
 * TODO: 1つのIDに複数の処理を登録できるようにする
 *
 * Registry Pattern + Strategy Pattern
 * - 効果の一元管理と、交換しやすい実装
 * - Map による O(1) 高速ルックアップ
 */

import type { ChainableAction } from "$lib/domain/models/ChainableAction";

/**
 * チェーン可能な処理のレジストリ（クラス）
 *
 * カードIDをキーとして ChainableAction を管理する。
 * Strategy Pattern により、カード効果を交換可能に実装する。
 */
export class ChainableActionRegistry {
  /** チェーン可能な処理のマップ (Card ID → ChainableAction) */
  private static actions = new Map<number, ChainableAction>();

  /** そのゲームで使用する効果を登録する */
  static register(cardId: number, action: ChainableAction): void {
    this.actions.set(cardId, action);
  }

  /** レジストリから効果を取得する */
  static get(cardId: number): ChainableAction | undefined {
    return this.actions.get(cardId);
  }

  /** レジストリをクリアする（テスト用） */
  static clear(): void {
    this.actions.clear();
  }

  /** 登録済みカードIDの一覧を取得する（デバッグ用） */
  static getRegisteredCardIds(): number[] {
    return Array.from(this.actions.keys());
  }
}
