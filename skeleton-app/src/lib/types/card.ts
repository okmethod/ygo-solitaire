// カードタイプの定義
export type CardType = "monster" | "spell" | "trap";

// モンスターカード専用のプロパティ
export interface MonsterCardProperties {
  attack?: number;
  defense?: number;
  level?: number;
  attribute?: string;
  race?: string;
}

// カード画像のプロパティ
export interface CardImageProperties {
  image?: string; // URL to card image
  imageSmall?: string; // URL to small card image
  imageCropped?: string; // URL to cropped card image
}

// UI用のプロパティ
export interface CardUIProperties {
  isSelected?: boolean;
  position?: "attack" | "defense" | "facedown";
  quantity?: number; // デッキ内での枚数
}

// 静的なカードのデータ（APIから取得される不変のデータ）
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

// ゲーム内で利用する動的なカードインスタンス
export interface Card extends CardData {
  // UI用プロパティ（動的な状態を含む）
  ui?: CardUIProperties;
}
