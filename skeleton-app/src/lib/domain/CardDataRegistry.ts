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
      throw new Error(
        `Card data not found in registry: ${cardId}. ` +
          `Please register this card using CardDataRegistry.register() in initializeCardDataRegistry().`,
      );
    }
    return card;
  }

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
// ビルダーヘルパー
// ===========================

/** モンスターカードを登録する */
function monster(frameType: FrameSubType, cardId: number, jaName: string): void {
  CardDataRegistry.register(cardId, { jaName, type: "monster", frameType });
}

/** 魔法カードを登録する */
function spell(spellType: SpellSubType, cardId: number, jaName: string): void {
  CardDataRegistry.register(cardId, { jaName, type: "spell", frameType: "spell", spellType });
}

/** 罠カードを登録する */
function trap(trapType: TrapSubType, cardId: number, jaName: string): void {
  CardDataRegistry.register(cardId, { jaName, type: "trap", frameType: "trap", trapType });
}

// ===========================
// 初期化関数
// ===========================

/** 本番用カードデータを登録する */
export function initializeCardDataRegistry(): void {
  // モンスターカード
  monster("effect", 33396948, "封印されしエクゾディア");
  monster("normal", 7902349, "封印されし者の右腕");
  monster("normal", 70903634, "封印されし者の左腕");
  monster("normal", 44519536, "封印されし者の左足");
  monster("normal", 8124921, "封印されし者の右足");
  monster("effect", 70791313, "王立魔法図書館");

  // 魔法カード
  spell("normal", 55144522, "強欲な壺");
  spell("normal", 79571449, "天使の施し");
  spell("normal", 70368879, "成金ゴブリン");
  spell("normal", 33782437, "一時休戦");
  spell("normal", 85852291, "打ち出の小槌");
  spell("normal", 90928333, "闇の量産工場");
  spell("normal", 73628505, "テラ・フォーミング");
  spell("normal", 98494543, "魔法石の採掘");
  spell("normal", 93946239, "無の煉獄");
  spell("normal", 98645731, "強欲で謙虚な壺");
  spell("normal", 59750328, "命削りの宝札");
  spell("normal", 89997728, "トゥーンのもくじ");
  spell("quick-play", 74519184, "手札断札");
  spell("continuous", 15259703, "トゥーン・ワールド");
  spell("field", 67616300, "チキンレース");

  // 罠カード
  trap("normal", 83968380, "強欲な瓶");
}

/** テスト用カードデータを登録する */
export function initializeTestCardData(): void {
  // テスト用通常魔法
  spell("normal", 1001, "Test Spell 1");
  spell("normal", 1002, "Test Spell 2");
  spell("normal", 1003, "Test Spell 3");

  // テスト用速攻魔法
  spell("quick-play", 1004, "Test Spell 4");

  // テスト用永続魔法
  spell("continuous", 1005, "Test Spell 5");

  // テスト用フィールド魔法
  spell("field", 1006, "Test Spell 6");

  // テスト用モンスター
  monster("normal", 12345678, "Test Monster A");
  monster("normal", 87654321, "Test Monster B");
}
