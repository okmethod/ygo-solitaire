/**
 * cardDetailDisplayStore - カード詳細表示用のストア
 *
 * UIコンポーネントで表示するカード情報を管理する。
 * 表示時に zonesDisplayStore から取得した CardDisplayData を渡してセットし、
 * 非表示時にクリアする。
 */

import { writable } from "svelte/store";
import type { CardDisplayData } from "$lib/presentation/types";

/** カード詳細表示用のストア */
export const selectedCardForDisplay = writable<CardDisplayData | null>(null);

/** カード詳細表示を表示する */
export function showCardDetailDisplay(card: CardDisplayData) {
  selectedCardForDisplay.set(card);
}

/** カード詳細表示を非表示にする */
export function hideCardDetailDisplay() {
  selectedCardForDisplay.set(null);
}
