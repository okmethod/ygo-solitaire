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
