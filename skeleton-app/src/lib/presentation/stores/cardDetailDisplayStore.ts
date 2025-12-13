import { writable } from "svelte/store";
import type { Card } from "$lib/presentation/types/card";

/**
 * カード詳細表示用のストア
 * UIコンポーネントで表示するカード情報を管理
 *
 * Note: Card型はCardDisplayDataのエイリアスです
 */
export const selectedCardForDisplay = writable<Card | null>(null);

/**
 * カード詳細表示を表示する
 *
 * @param card - 表示するカード情報（CardDisplayData）
 */
export function showCardDetailDisplay(card: Card) {
  selectedCardForDisplay.set(card);
}

/**
 * カード詳細表示を非表示にする
 */
export function hideCardDetailDisplay() {
  selectedCardForDisplay.set(null);
}
