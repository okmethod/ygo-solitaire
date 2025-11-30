import { writable } from "svelte/store";
import type { Card } from "$lib/types/card";

/**
 * カード詳細表示用のストア（T046, T060）
 * UIコンポーネントで表示するカード情報を管理
 *
 * Note: Card型はCardDisplayDataのエイリアスです（T060）
 */
export const selectedCardForDisplay = writable<Card | null>(null);

export function showCardDetailDisplay(card: Card) {
  selectedCardForDisplay.set(card);
}

export function hideCardDetailDisplay() {
  selectedCardForDisplay.set(null);
}
