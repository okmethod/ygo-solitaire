import { writable } from "svelte/store";
import type { CardData } from "$lib/types/card";

export const selectedCardForDisplay = writable<CardData | null>(null);

export function showCardDetailDisplay(card: CardData) {
  selectedCardForDisplay.set(card);
}

export function hideCardDetailDisplay() {
  selectedCardForDisplay.set(null);
}
