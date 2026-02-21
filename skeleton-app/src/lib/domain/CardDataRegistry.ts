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

import type { CardData, FrameSubType, SpellSubType, TrapSubType } from "$lib/domain/models/Card";

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

// ===========================
// マップエントリ生成ヘルパー
// ===========================

type RegistrationEntry = [number, () => void];

/** モンスターカードのエントリを生成 */
const monster = (frameType: FrameSubType, id: number, jaName: string): RegistrationEntry => [
  id,
  () => CardDataRegistry.register(id, { jaName, type: "monster", frameType }),
];

/** 魔法カードのエントリを生成 */
const spell = (spellType: SpellSubType, id: number, jaName: string): RegistrationEntry => [
  id,
  () => CardDataRegistry.register(id, { jaName, type: "spell", frameType: "spell", spellType }),
];

/** 罠カードのエントリを生成 */
const trap = (trapType: TrapSubType, id: number, jaName: string): RegistrationEntry => [
  id,
  () => CardDataRegistry.register(id, { jaName, type: "trap", frameType: "trap", trapType }),
];

// ===========================
// 定義マップ
// ===========================

/** カードID → 登録関数のマッピング */
const cardDataRegistrations = new Map<number, () => void>([
  // モンスターカード
  monster("effect", 33396948, "封印されしエクゾディア"),
  monster("normal", 7902349, "封印されし者の右腕"),
  monster("normal", 70903634, "封印されし者の左腕"),
  monster("normal", 44519536, "封印されし者の左足"),
  monster("normal", 8124921, "封印されし者の右足"),
  monster("effect", 70791313, "王立魔法図書館"),

  // 魔法カード
  spell("normal", 55144522, "強欲な壺"),
  spell("normal", 79571449, "天使の施し"),
  spell("normal", 70368879, "成金ゴブリン"),
  spell("normal", 33782437, "一時休戦"),
  spell("normal", 85852291, "打ち出の小槌"),
  spell("normal", 90928333, "闇の量産工場"),
  spell("normal", 73628505, "テラ・フォーミング"),
  spell("normal", 98494543, "魔法石の採掘"),
  spell("normal", 93946239, "無の煉獄"),
  spell("normal", 98645731, "強欲で謙虚な壺"),
  spell("normal", 59750328, "命削りの宝札"),
  spell("normal", 89997728, "トゥーンのもくじ"),
  spell("quick-play", 74519184, "手札断札"),
  spell("continuous", 15259703, "トゥーン・ワールド"),
  spell("field", 67616300, "チキンレース"),

  // 罠カード
  trap("normal", 83968380, "強欲な瓶"),
]);

// ===========================
// 登録関数
// ===========================

/** レジストリをクリアし、指定されたカードIDの CardData を登録する */
export function registerCardDataByIds(cardIds: number[]): void {
  CardDataRegistry.clear();

  for (const cardId of cardIds) {
    const register = cardDataRegistrations.get(cardId);
    if (register) {
      register();
    }
  }
}
