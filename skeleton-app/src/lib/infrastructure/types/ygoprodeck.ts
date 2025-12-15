/**
 * Infrastructure Layer: YGOPRODeck API External Types
 *
 * YGOPRODeck API v7のレスポンス型定義。
 * Infrastructure層の外部API統合で使用される。
 *
 * @module infrastructure/types/ygoprodeck
 * @see https://ygoprodeck.com/api-guide/
 */

interface YGOProDeckCardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

interface YGOProDeckCardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code: string;
  set_price: string;
}

interface YGOProDeckCardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuffinc_price: string;
}

/**
 * YGOPRODeck API カードデータ型
 *
 * YGOPRODeck API v7のカードレスポンス。
 * Infrastructure層のAdapter（YGOProDeckCardRepository）でこの型から
 * Application層のDTO（CardDisplayData）に変換される。
 */
export interface YGOProDeckCard {
  id: number;
  name: string;
  type: string;
  frameType?: string; // Optional field for card frame type
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  archetype?: string;
  ygoprodeck_url: string;
  card_sets?: YGOProDeckCardSet[];
  card_images: YGOProDeckCardImage[];
  card_prices?: YGOProDeckCardPrice[];
}
