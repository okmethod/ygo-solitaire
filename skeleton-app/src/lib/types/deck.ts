import type { Card } from "./card";

// デッキレシピ（設計図）の型定義
export interface DeckRecipeData {
  name: string;
  mainDeck: Card[];
  extraDeck: Card[];
  description?: string;
  category?: string;
}

// 実際のゲーム用デッキ（インスタンス）の型定義
export interface DeckData {
  name: string;
  mainDeck: Card[];
  extraDeck: Card[];
  sideDeck: Card[];
  hand: Card[];
  field: {
    monsterZones: (Card | null)[];
    spellTrapZones: (Card | null)[];
    extraMonsterZone: Card | null;
    fieldSpell: Card | null;
  };
  graveyard: Card[];
  banished: Card[];
  createdAt: Date;
  sourceRecipe?: string; // 元となったデッキレシピの名前
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

// デッキレシピの統計情報（設計図用）
export interface RecipeStats extends DeckStats {
  // デッキレシピ特有の統計（将来の拡張用）
  recipeVersion?: string;
  lastValidated?: Date;
}

export interface GameDeckStats {
  mainDeckRemaining: number;
  extraDeckRemaining: number;
  handSize: number;
  graveyardSize: number;
  banishedSize: number;
  fieldStatus: {
    monstersOnField: number;
    spellTrapsOnField: number;
    hasFieldSpell: boolean;
  };
}

export type SortCriteria = "name" | "type" | "level" | "attack" | "defense" | "rarity";
export type SortOrder = "asc" | "desc";
