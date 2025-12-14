/**
 * Application Layer: Deck Recipe Data Transfer Objects (DTOs)
 *
 * Application層が定義するデッキレシピデータの契約。
 * デッキ管理機能で使用されるデータ構造を定義する。
 *
 * @module application/types/deck
 */

import type { CardDisplayData } from "$lib/application/types/card";

/**
 * レシピ保存時のカードエントリー（ID + 枚数 + 効果情報）
 * データベースやJSONファイルに保存する軽量な形式
 */
export interface RecipeCardEntry {
  id: number; // YGOPRODeck API の数値 ID
  quantity: number; // 枚数
  effectClass?: string; // 効果クラス名（オプション）
}

/**
 * ロード済みカードエントリー（CardDisplayData + 枚数）
 * APIからロードしたカードデータと枚数の組み合わせ
 * Application層のDTOを使用
 */
export interface LoadedCardEntry {
  cardData: CardDisplayData; // カードのUI表示データ
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
 * Application層のDTO: 保存用デッキレシピ
 *
 * 軽量なID+枚数形式でデータを保持。
 * sampleDeckRecipes.tsで使用される。
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
 * エクストラデッキの構造（モンスタータイプ別に事前分類）
 */
export interface ExtraDeckData {
  fusion: LoadedCardEntry[]; // 融合モンスター
  synchro: LoadedCardEntry[]; // シンクロモンスター
  xyz: LoadedCardEntry[]; // エクシーズモンスター
}

/**
 * ロード済みデッキデータ
 * CardDisplayDataと枚数を保持し、カードタイプ別に事前分類済み
 * フィルタリング処理を不要にしてパフォーマンス向上
 */
export interface DeckData extends DeckBase {
  mainDeck: MainDeckData; // カードタイプ別に分類済み
  extraDeck: ExtraDeckData; // モンスタータイプ別に分類済み
  stats: DeckStats; // 統計情報を事前計算
}
