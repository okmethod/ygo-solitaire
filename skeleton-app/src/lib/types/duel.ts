import type { Card } from "$lib/types/card";

// 実際のゲーム用決闘状態（インスタンス）の型定義
export interface DuelStateData {
  name: string;
  mainDeck: Card[];
  extraDeck: Card[];
  sideDeck: Card[];
  hands: Card[];
  field: {
    monsterZones: (Card | null)[];
    spellTrapZones: (Card | null)[];
    fieldSpell: Card | null;
  };
  graveyard: Card[];
  banished: Card[];
  createdAt: Date;
  sourceRecipe?: string; // 元となったデッキレシピの名前
}

export interface GameDuelStats {
  mainDeckRemaining: number;
  extraDeckRemaining: number;
  handsSize: number;
  graveyardSize: number;
  banishedSize: number;
  fieldStatus: {
    monstersOnField: number;
    spellTrapsOnField: number;
    hasFieldSpell: boolean;
  };
}
