import type { Card } from "$lib/types/card";

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
  sourceRecipe?: string; // デッキレシピ名
}

export interface DuelStats {
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
