export interface Card {
  id: string;
  name: string;
  type: "monster" | "spell" | "trap";
  image?: string;
  description?: string;
  attack?: number;
  defense?: number;
  level?: number;
  attribute?: string;
  race?: string;
  rarity?: "common" | "rare" | "super_rare" | "ultra_rare" | "secret_rare";
  cardNumber?: string;
  restriction?: "unlimited" | "semi_limited" | "limited" | "forbidden";
  isSelected?: boolean;
  position?: "attack" | "defense" | "facedown";
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
