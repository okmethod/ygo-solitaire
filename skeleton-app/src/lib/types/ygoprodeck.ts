import type { Card, CardDisplayData, CardImages, MonsterAttributes, CardType } from "$lib/types/card";

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

/**
 * カードタイプを正規化する内部関数
 *
 * YGOPRODeck APIのtype文字列をCardTypeに変換
 * @param {string} type - YGOPRODeck APIのtype文字列
 * @returns {CardType} 正規化されたカードタイプ
 * @throws {Error} 未知のカードタイプ
 */
function normalizeType(type: string): CardType {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";

  // 未知のカードタイプはエラーとして扱う
  console.error(`Unknown card type: ${type}`);
  throw new Error(
    `Unable to normalize card type: "${type}". ` + `Expected type containing "monster", "spell", or "trap".`,
  );
}

/**
 * YGOPRODeck API カードデータをCardに変換
 *
 * @param apiCard - YGOPRODeck APIから取得したカードデータ
 * @returns Card - UI表示用カードデータ
 */
export function convertYGOProDeckCardToCard(apiCard: YGOProDeckCard): Card {
  return convertToCardDisplayData(apiCard);
}

/**
 * 複数の YGOPRODeck カードを Card 配列に変換
 */
export function convertYGOProDeckCardsToCards(apiCards: YGOProDeckCard[]): Card[] {
  return apiCards.map((card) => convertToCardDisplayData(card));
}

/**
 * YGOPRODeck API カードデータをCardDisplayDataに変換
 *
 * Presentation Layer用の変換関数。
 * CardDataとは異なり、画像とモンスター属性を明示的な型で返す。
 *
 * @param apiCard - YGOPRODeck APIから取得したカードデータ
 * @returns CardDisplayData - UI表示用カードデータ
 */
export function convertToCardDisplayData(apiCard: YGOProDeckCard): CardDisplayData {
  const cardType = normalizeType(apiCard.type);
  const cardImage = apiCard.card_images[0];

  // 画像データの変換
  const images: CardImages | undefined = cardImage
    ? {
        image: cardImage.image_url,
        imageSmall: cardImage.image_url_small,
        imageCropped: cardImage.image_url_cropped,
      }
    : undefined;

  // モンスターカード属性の変換
  const monsterAttributes: MonsterAttributes | undefined =
    cardType === "monster" && apiCard.atk !== undefined && apiCard.def !== undefined && apiCard.level !== undefined
      ? {
          attack: apiCard.atk,
          defense: apiCard.def,
          level: apiCard.level,
          attribute: apiCard.attribute ?? "",
          race: apiCard.race ?? "",
        }
      : undefined;

  return {
    id: apiCard.id,
    name: apiCard.name,
    type: cardType,
    description: apiCard.desc,
    frameType: apiCard.frameType,
    archetype: apiCard.archetype,
    monsterAttributes,
    images,
  };
}
