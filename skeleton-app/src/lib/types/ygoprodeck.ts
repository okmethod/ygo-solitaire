import type { Card, CardData, CardType } from "$lib/types/card";

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

export interface YGOProDeckCard {
  id: number;
  name: string;
  type: string;
  frameType: string;
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

// カードタイプを正規化する内部関数
function normalizeType(type: string): CardType {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";

  // デフォルトはmonster（安全のため）
  return "monster";
}

export function convertYGOProDeckCardToCardData(apiCard: YGOProDeckCard): CardData {
  // 画像URL を取得（最初の画像を使用）
  const cardImage = apiCard.card_images[0];

  const cardType = normalizeType(apiCard.type);

  return {
    id: apiCard.id,
    name: apiCard.name,
    type: cardType,
    description: apiCard.desc,
    frameType: apiCard.frameType,
    archetype: apiCard.archetype,

    // モンスターカード専用プロパティ
    monster:
      cardType === "monster"
        ? {
            attack: apiCard.atk,
            defense: apiCard.def,
            level: apiCard.level,
            attribute: apiCard.attribute,
            race: apiCard.race,
          }
        : undefined,

    // 画像プロパティ
    images: cardImage
      ? {
          image: cardImage.image_url,
          imageSmall: cardImage.image_url_small,
          imageCropped: cardImage.image_url_cropped,
        }
      : undefined,
  };
}

export function convertYGOProDeckCardToCard(apiCard: YGOProDeckCard): Card {
  const cardData = convertYGOProDeckCardToCardData(apiCard);

  return {
    ...cardData,
    // ゲーム状態プロパティは初期値なし（必要に応じて後で設定）
  };
}

/**
 * 複数の YGOPRODeck カードを Card 配列に変換
 */
export function convertYGOProDeckCardsToCards(apiCards: YGOProDeckCard[]): Card[] {
  return apiCards.map((card) => convertYGOProDeckCardToCard(card));
}
