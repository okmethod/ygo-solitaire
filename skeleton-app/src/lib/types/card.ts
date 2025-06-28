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

/**
 * 静的なカードマスターデータ
 * APIから取得される不変のカード情報を表現
 * デッキレシピやカードデータベースで使用
 */
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

/**
 * ゲーム内で使用する動的なカードインスタンス
 * CardDataにゲーム状態（選択状態、フィールド上の位置など）を追加
 * 実際のデュエル中にのみ使用
 */
export interface Card extends CardData {
  isSelected?: boolean; // UI上での選択状態
  position?: "attack" | "defense" | "facedown"; // フィールド上での表示形式
}
