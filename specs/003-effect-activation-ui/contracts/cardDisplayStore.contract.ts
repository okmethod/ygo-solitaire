/**
 * Contract: cardDisplayStore
 *
 * Purpose: CardInstance → CardDisplayData変換を提供するリアクティブストア
 * Location: src/lib/application/stores/cardDisplayStore.ts
 * Layer: Application
 */

import type { Readable } from 'svelte/store';
import type { CardDisplayData } from '$lib/types/card';

/**
 * 手札のCardDisplayData配列を提供
 *
 * - gameStateStore.zones.handの変更を監視
 * - 自動的にYGOPRODeck APIから取得
 * - キャッシュヒット時は即座に返す
 * - エラー時は空配列を返す
 */
export const handCards: Readable<CardDisplayData[]>;

/**
 * フィールドのCardDisplayData配列を提供
 *
 * - gameStateStore.zones.fieldの変更を監視
 * - モンスター・魔法・罠すべてを含む
 */
export const fieldCards: Readable<CardDisplayData[]>;

/**
 * 墓地のCardDisplayData配列を提供
 *
 * - gameStateStore.zones.graveyardの変更を監視
 */
export const graveyardCards: Readable<CardDisplayData[]>;

/**
 * 除外ゾーンのCardDisplayData配列を提供
 *
 * - gameStateStore.zones.banishedの変更を監視
 */
export const banishedCards: Readable<CardDisplayData[]>;

/**
 * instanceIdからCardDisplayDataを検索するヘルパー関数
 *
 * @param instanceId - CardInstanceの一意識別子
 * @param allCards - 検索対象のCardDisplayData配列
 * @returns 見つかったCardDisplayData、または null
 */
export function getCardDisplayDataByInstanceId(
  instanceId: string,
  allCards: CardDisplayData[]
): CardDisplayData | null;

/**
 * 実装要件:
 *
 * 1. Svelte derived()を使用してリアクティブストアを実装
 * 2. gameStateStoreの変更を監視し、CardInstance.cardIdを抽出
 * 3. getCardsByIds(fetch, cardIds)を呼び出してバッチ取得
 * 4. 取得したCardDisplayData[]をset()でストアに設定
 * 5. エラー時はconsole.errorログ + 空配列をset()
 * 6. 初期値は [] (CardDisplayData[])
 *
 * パフォーマンス要件:
 * - キャッシュヒット時: <1ms
 * - APIリクエスト時: <500ms
 * - 同時表示40カード対応
 *
 * エラーハンドリング:
 * - API失敗時: 空配列を返す（placeholder表示）
 * - Rate Limit超過時: console.errorログ
 */
