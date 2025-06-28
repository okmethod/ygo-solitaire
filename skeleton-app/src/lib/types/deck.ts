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
 * メインデッキの構造（カードタイプ別に事前分類）
 */
export interface MainDeckData {
  monsters: LoadedCardEntry[]; // モンスターカード
  spells: LoadedCardEntry[]; // 魔法カード
  traps: LoadedCardEntry[]; // 罠カード
}

/**
 * ロード済みデッキデータ
 * CardDataと枚数を保持し、カードタイプ別に事前分類済み
 * フィルタリング処理を不要にしてパフォーマンス向上
 */
export interface DeckData extends DeckBase {
  mainDeck: MainDeckData; // カードタイプ別に分類済み
  extraDeck: LoadedCardEntry[]; // エクストラデッキ（分類不要）
  stats: DeckStats; // 統計情報を事前計算
}
