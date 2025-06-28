export type CardType = "monster" | "spell" | "trap";

interface MonsterCardProperties {
  attack?: number;
  defense?: number;
  level?: number;
  attribute?: string;
  race?: string;
}

interface CardImageProperties {
  image?: string; // URL to card image
  imageSmall?: string; // URL to small card image
  imageCropped?: string; // URL to cropped card image
}

// 静的なカードデータ
export interface CardData {
  // 必須プロパティ
  id: number; // YGOPRODeck API uses numeric IDs
  name: string;
  type: CardType;
  description: string; // API always provides description

  // オプショナルなAPIプロパティ
  frameType?: string; // API provides frameType like "normal", "effect", etc.
  archetype?: string; // API provides archetype information

  // モンスターカード専用プロパティ
  monster?: MonsterCardProperties;

  // 画像プロパティ
  images?: CardImageProperties;
}

// ゲームで使用する動的なカードインスタンス用のインターフェース
export interface Card extends CardData {
  isSelected?: boolean;
  position?: "attack" | "defense" | "facedown";
  quantity?: number; // デッキ内での枚数
}
