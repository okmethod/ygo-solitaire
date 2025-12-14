/**
 * Presentation Layer: YGOPRODeck Type Aliases
 *
 * Infrastructure層の外部API型を再エクスポートし、Presentation層のコンポーネントに提供。
 * 型定義の実体はInfrastructure層にあり、Presentation層は型エイリアスのみを持つ。
 *
 * **Backward Compatibility**: 既存のコンポーネントがimport pathを変更せずに動作するための互換層。
 *
 * @module presentation/types/ygoprodeck
 */

// Infrastructure層の外部API型を再エクスポート
export type { YGOProDeckCard } from "$lib/infrastructure/types/ygoprodeck";

// Application層のDTOも再エクスポート（後方互換性）
export type { Card, CardDisplayData } from "$lib/presentation/types/card";
