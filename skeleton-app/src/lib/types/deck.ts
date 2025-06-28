import type { CardData } from "$lib/types/card";

// カード ID と枚数の組み合わせ
export interface DeckCardEntry {
  id: number; // YGOPRODeck API の数値 ID
  quantity: number; // 枚数
}

// CardData と枚数の組み合わせ
export interface DeckCardData {
  card: CardData; // カードの静的データ
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
  // CardData と枚数を保持（同名カードの重複インスタンスを避ける）
  mainDeck: DeckCardData[];
  extraDeck: DeckCardData[];
}
