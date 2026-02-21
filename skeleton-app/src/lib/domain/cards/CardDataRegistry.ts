/**
 * CardDataRegistry - カードデータレジストリ
 *
 * Card ID → CardData のマッピングを管理
 *
 * Registry Pattern
 * - カードデータの一元管理
 * - Map による O(1) 高速ルックアップ
 * - ドメイン層をインフラ層（YGOPRODeck API）から分離
 *
 * @module domain/registries/CardDataRegistry
 */

import type { CardData } from "$lib/domain/models/Card";

/**
 * 登録用のカードデータ（id を除いた型）
 *
 * register() 時に cardId をキーとして渡すため、id は自動設定される。
 */
type CardDataInput = Omit<CardData, "id">;

/**
 * カードデータレジストリ（クラス）
 *
 * カードIDをキーとして CardData を管理する。
 */
export class CardDataRegistry {
  /** カードデータのマップ (Card ID → CardData) */
  private static cards = new Map<number, CardData>();

  // ===========================
  // 登録API
  // ===========================

  /** カードデータを登録する */
  static register(cardId: number, input: CardDataInput): void {
    const cardData: CardData = { id: cardId, ...input };
    this.cards.set(cardId, cardData);
  }

  // ===========================
  // 取得API
  // ===========================

  /** カードデータを取得する（見つからない場合は undefined） */
  static getOrUndefined(cardId: number): CardData | undefined {
    return this.cards.get(cardId);
  }

  /**
   * カードデータを取得する（見つからない場合はエラーをスロー）
   *
   * @throws Error if card not found in registry
   */
  static get(cardId: number): CardData {
    const card = this.cards.get(cardId);
    if (!card) {
      throw new Error(`Card data not found in registry: ${cardId}.`);
    }
    return card;
  }

  /**
   * コールバック用のバインド済み get 関数
   *
   * 静的メソッドを直接渡すと this コンテキストが失われるため、
   * アロー関数でラップしたものを提供する。
   */
  static readonly getCard = (cardId: number): CardData => CardDataRegistry.get(cardId);

  /**
   * 《》付きでカード名を取得する
   *
   * @example
   * getCardNameWithBrackets(55144522) // "《強欲な壺》"
   */
  static getCardNameWithBrackets(cardId: number): string {
    const card = this.get(cardId);
    return `《${card.jaName}》`;
  }

  /** カードが登録されているか判定する */
  static has(cardId: number): boolean {
    return this.cards.has(cardId);
  }

  // ===========================
  // ユーティリティAPI
  // ===========================

  /** レジストリをクリアする（テスト用） */
  static clear(): void {
    this.cards.clear();
  }

  /** 登録済みカードIDの一覧を取得する（デバッグ用） */
  static getRegisteredCardIds(): number[] {
    return Array.from(this.cards.keys());
  }
}
