import type { Card } from "$lib/types/card";
import type { YGOProDeckCard } from "$lib/api/ygoprodeck";

/**
 * YGOPRODeck API のレスポンスを Card インターフェースに変換
 */
export function convertYGOProDeckCardToCard(apiCard: YGOProDeckCard, quantity = 1): Card {
  // カードタイプを正規化
  const normalizeType = (type: string): "monster" | "spell" | "trap" => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("monster")) return "monster";
    if (lowerType.includes("spell")) return "spell";
    if (lowerType.includes("trap")) return "trap";

    // デフォルトはmonster（安全のため）
    return "monster";
  };

  // 画像URL を取得（最初の画像を使用）
  const cardImage = apiCard.card_images[0];

  return {
    id: apiCard.id,
    name: apiCard.name,
    type: normalizeType(apiCard.type),
    frameType: apiCard.frameType,
    description: apiCard.desc,
    attack: apiCard.atk,
    defense: apiCard.def,
    level: apiCard.level,
    attribute: apiCard.attribute,
    race: apiCard.race,
    archetype: apiCard.archetype,
    image: cardImage?.image_url,
    imageSmall: cardImage?.image_url_small,
    imageCropped: cardImage?.image_url_cropped,
    quantity,
  };
}

/**
 * 複数の YGOPRODeck カードを Card 配列に変換
 */
export function convertYGOProDeckCardsToCards(apiCards: YGOProDeckCard[]): Card[] {
  return apiCards.map((card) => convertYGOProDeckCardToCard(card));
}
