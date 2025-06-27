import type { Card } from "./card";

// デッキレシピ関連の型定義
export interface DeckRecipeData {
  name: string;
  mainDeck: Card[];
  extraDeck: Card[];
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  category?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: "DECK_SIZE" | "CARD_LIMIT" | "FORBIDDEN_CARD" | "INVALID_CARD";
  message: string;
  cardId?: string;
  cardName?: string;
}

export interface ValidationWarning {
  type: "DECK_RECOMMENDATION" | "CARD_SYNERGY";
  message: string;
  cardId?: string;
}

export interface CardTypeStats {
  monster: number;
  spell: number;
  trap: number;
}

export interface DeckStats {
  totalCards: { main: number; extra: number };
  typeDistribution: CardTypeStats;
  levelDistribution: Record<number, number>;
  attributeDistribution: Record<string, number>;
  raceDistribution: Record<string, number>;
}

export type SortCriteria = "name" | "type" | "level" | "attack" | "defense" | "rarity";
export type SortOrder = "asc" | "desc";

export interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  mainDeck: Card[];
  extraDeck: Card[];
  author?: string;
  isOfficial?: boolean;
}