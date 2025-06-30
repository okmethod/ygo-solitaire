import { writable } from "svelte/store";
import type { CardData } from "$lib/types/card";

export const selectedCardForDetail = writable<CardData | null>(null);

export function showCardDetail(card: CardData) {
  selectedCardForDetail.set(card);
}

export function hideCardDetail() {
  selectedCardForDetail.set(null);
}
