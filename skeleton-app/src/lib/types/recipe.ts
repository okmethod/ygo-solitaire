import type { Card } from "$lib/types/card";

// カード ID と枚数の組み合わせ
export interface DeckCardEntry {
  id: number; // YGOPRODeck API の数値 ID
  quantity: number; // 枚数
}

// API 用のデッキレシピ（カード ID のみ保持）
export interface DeckRecipeData {
  name: string;
  mainDeck: DeckCardEntry[];
  extraDeck: DeckCardEntry[];
  description?: string;
  category?: string;
}

// UI 用のデッキレシピ（Card オブジェクト保持）
export interface DeckRecipe {
  name: string;
  mainDeck: Card[];
  extraDeck: Card[];
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
  totalCards: { main: number; extra: number; total: number };
  typeDistribution: CardTypeStats;
  levelDistribution: Record<number, number>;
  attributeDistribution: Record<string, number>;
  raceDistribution: Record<string, number>;
}

export type SortCriteria = "name" | "type" | "level" | "attack" | "defense" | "rarity";
export type SortOrder = "asc" | "desc";
