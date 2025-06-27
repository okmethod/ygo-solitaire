export interface Card {
  id: number; // YGOPRODeck API uses numeric IDs
  name: string;
  type: "monster" | "spell" | "trap";
  frameType?: string; // API provides frameType like "normal", "effect", etc.
  description: string; // API always provides description
  attack?: number;
  defense?: number;
  level?: number;
  attribute?: string;
  race?: string;
  archetype?: string; // API provides archetype information
  image?: string; // URL to card image
  imageSmall?: string; // URL to small card image
  imageCropped?: string; // URL to cropped card image
  // 以下は UI 用のプロパティ（API からは取得しない）
  isSelected?: boolean;
  position?: "attack" | "defense" | "facedown";
  quantity?: number; // デッキ内での枚数
}

export interface CardComponentProps {
  card?: Card;
  size?: "small" | "medium" | "large";
  showDetails?: boolean;
  clickable?: boolean;
  selectable?: boolean;
  placeholder?: boolean;
  placeholderText?: string;
  rotation?: number;
  animate?: boolean;
  onClick?: (card: Card) => void;
  onHover?: (card: Card | null) => void;
}
