import type { CardData } from "$lib/types/card";

/**
 * レシピ保存時のカードエントリー（ID + 枚数）
 * データベースやJSONファイルに保存する軽量な形式
 */
export interface RecipeCardEntry {
  id: number; // YGOPRODeck API の数値 ID
  quantity: number; // 枚数
}

/**
 * ロード済みカードエントリー（CardData + 枚数）
 * APIからロードしたカードデータと枚数の組み合わせ
 * UI表示やゲーム処理で使用
 */
export interface LoadedCardEntry {
  cardData: CardData; // カードの静的データ
  quantity: number; // 枚数
}

/**
 * デッキ統計情報
 */
export interface DeckStats {
  totalCards: number; // 総カード数
  monsterCount: number; // モンスターカード数
  spellCount: number; // 魔法カード数
  trapCount: number; // 罠カード数
  uniqueCards: number; // ユニークカード種類数
}

interface DeckBase {
  name: string;
  description?: string;
  category?: string;
}

/**
 * 保存用デッキレシピ
 * 軽量なID+枚数形式でデータを保持
 */
export interface DeckRecipe extends DeckBase {
  mainDeck: RecipeCardEntry[];
  extraDeck: RecipeCardEntry[];
}

/**
 * ロード済みデッキデータ
 * CardDataと枚数を保持し、統計情報も含む
 * 同名カードの重複インスタンスを避けてメモリ効率化
 */
export interface DeckData extends DeckBase {
  mainDeck: LoadedCardEntry[];
  extraDeck: LoadedCardEntry[];
  stats: DeckStats; // 統計情報を事前計算
}
