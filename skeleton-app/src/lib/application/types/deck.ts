/**
 * deck - デッキレシピデータの DTO (Data Transfer Object)
 *
 * デッキ管理機能で使用されるデータ構造。
 *
 * @module application/types/deck
 */

import type { CardDisplayData } from "$lib/application/types/card";

/** レシピ保存用カードエントリー (ID + 枚数) */
export interface RecipeCardEntry {
  id: number;
  quantity: number;
}

/** ロード済みカードエントリー (CardDisplayData + 枚数) */
export interface LoadedCardEntry {
  cardData: CardDisplayData;
  quantity: number;
}

/** デッキ統計情報 */
export interface DeckStats {
  totalCards: number;
  monsterCount: number;
  spellCount: number;
  trapCount: number;
  uniqueCards: number;
}

// デッキ基本情報
interface DeckBase {
  name: string;
  description?: string;
  category?: string;
}

/** 保存用デッキレシピ (軽量な ID + 枚数形式) */
export interface DeckRecipe extends DeckBase {
  mainDeck: RecipeCardEntry[];
  extraDeck: RecipeCardEntry[];
}

/** メインデッキの構造 (カードタイプ別に事前分類) */
export interface MainDeckData {
  monsters: LoadedCardEntry[];
  spells: LoadedCardEntry[];
  traps: LoadedCardEntry[];
}

/** エクストラデッキの構造 (モンスタータイプ別に事前分類) */
export interface ExtraDeckData {
  fusion: LoadedCardEntry[];
  synchro: LoadedCardEntry[];
  xyz: LoadedCardEntry[];
}

/**
 * ロード済みデッキデータ (事前分類・統計計算済み)
 *
 * カードタイプ別に事前分類し、統計情報を事前計算することで、
 * UI でのフィルタリング処理を不要にしてパフォーマンスを向上させる。
 */
export interface DeckData extends DeckBase {
  mainDeck: MainDeckData;
  extraDeck: ExtraDeckData;
  stats: DeckStats;
}
