/**
 * Port: カードデータ取得の抽象インターフェース
 *
 * Application Layer が依存する契約を定義。
 * Infrastructure Layer が具象実装を提供。
 * 
 * @remarks
 * - テスト時にモック実装を注入可能
 * - 将来的に別のカードAPI（ローカルストレージ、FastAPI等）への切り替えが容易
 * - YGOPRODeck APIの実装詳細から完全に分離
 *
 * @module application/ports/ICardDataRepository
 */

// ============================================================================
// YGOProDeck API から取得できるデータの型定義
// ============================================================================

/** カード画像情報 (YGOProDeck API) */
export interface YGOProCardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

/** カード収録パック情報 (YGOProDeck API) */
export interface YGOProCardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code: string;
  set_price: string;
}

/** カード価格情報 (YGOProDeck API) */
export interface YGOProCardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuffinc_price: string;
}

/** 禁止制限情報 (YGOProDeck API) */
export interface YGOProBanlistInfo {
  ban_tcg?: string;
  ban_ocg?: string;
  ban_goat?: string;
}

/**
 * カード情報 (YGOProDeck API) 
 *
 * API レスポンスの全フィールドを保持する。
 * Application 層で CardData と組み合わせて CardDisplayData を生成する。
 */
export interface YGOProDeckCardInfo {
  // 基本情報（全カード共通）
  id: number;
  name: string; // 英語名
  type: string; // "Spell Card", "Effect Monster", "Trap Card" など
  humanReadableCardType: string; // "Normal Spell", "Effect Monster" など
  frameType: string; // "spell", "effect", "trap", "normal" など
  desc: string; // カード効果テキスト
  race: string; // 魔法/罠: "Normal", "Continuous" 等、モンスター: 種族名
  ygoprodeck_url: string;

  // オプション（カードによって有無が異なる）
  archetype?: string;
  typeline?: string[]; // モンスターのみ: ["Spellcaster", "Effect"]

  // モンスター専用
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string; // "LIGHT", "DARK" など

  // 付加情報
  banlist_info?: YGOProBanlistInfo;
  card_images: YGOProCardImage[];
  card_sets?: YGOProCardSet[];
  card_prices?: YGOProCardPrice[];
}

// ============================================================================
// Repository インターフェース
// ============================================================================

/** カード情報取得の抽象インターフェース (YGOProDeck API) */
export interface ICardDataRepository {
  /** カードIDリストから複数のカードデータを取得 */
  getCardsByIds(fetchFunction: typeof fetch, cardIds: number[]): Promise<YGOProDeckCardInfo[]>;

  /** 単一のカードデータを取得 */
  getCardById(fetchFunction: typeof fetch, cardId: number): Promise<YGOProDeckCardInfo>;
}
