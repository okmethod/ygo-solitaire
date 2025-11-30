import { writable } from "svelte/store";
import type { Card, CardDisplayData } from "$lib/types/card";

/**
 * カード型の互換性（T046）
 * CardDisplayDataを優先しますが、既存のCard型も受け入れます
 */
type CardLike = CardDisplayData | Card;

/**
 * カード詳細表示用のストア（T046）
 * UIコンポーネントで表示するカード情報を管理
 */
export const selectedCardForDisplay = writable<CardLike | null>(null);

export function showCardDetailDisplay(card: CardLike) {
  selectedCardForDisplay.set(card);
}

export function hideCardDetailDisplay() {
  selectedCardForDisplay.set(null);
}
