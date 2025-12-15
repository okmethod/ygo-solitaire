/**
 * Presentation Layer: Deck Type Aliases
 *
 * Application層のDTOを再エクスポートし、Presentation層のコンポーネントに提供。
 * 型定義の実体はApplication層にあり、Presentation層は型エイリアスのみを持つ。
 *
 * **Backward Compatibility**: 既存のコンポーネントがimport pathを変更せずに動作するための互換層。
 *
 * @module presentation/types/deck
 */

// Application層のDTOを再エクスポート
export type {
  RecipeCardEntry,
  LoadedCardEntry,
  DeckStats,
  DeckRecipe,
  MainDeckData,
  ExtraDeckData,
  DeckData,
} from "$lib/application/types/deck";
