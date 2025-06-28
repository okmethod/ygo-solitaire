import type { Card } from "$lib/types/card";

// カード ID と枚数の組み合わせ
export interface DeckCardEntry {
  id: number; // YGOPRODeck API の数値 ID
  quantity: number; // 枚数
}

interface DeckBase {
  name: string;
  description?: string;
  category?: string;
}

// 保存用デッキレシピ
export interface DeckRecipe extends DeckBase {
  // カードIDのみ保持
  mainDeck: DeckCardEntry[];
  extraDeck: DeckCardEntry[];
}

// デッキレシピをロードして作成するデッキデータ
export interface DeckData extends DeckBase {
  // Card オブジェクトを保持
  mainDeck: Card[];
  extraDeck: Card[];
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

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
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
