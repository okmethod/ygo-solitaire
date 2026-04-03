/**
 * cardDetailDisplayStore - カード詳細表示用のストア
 *
 * UIコンポーネントで表示するカード情報を管理する。
 * 表示時に DisplayCardData を渡してセットし、非表示時にクリアする。
 */

import { writable, get } from "svelte/store";
import type { DisplayCardData } from "$lib/presentation/types";
const STORAGE_KEY = "cardDetailDisplayEnabled";

/** カード詳細表示機能の有効/無効状態 */
export const cardDetailDisplayEnabled = writable<boolean>(loadEnabledState());

/** カード詳細表示用のストア */
export const selectedCardForDisplay = writable<DisplayCardData | null>(null);

/** 常に有効（設定UIを廃止したため固定） */
function loadEnabledState(): boolean {
  return true;
}

/** カード詳細表示機能の有効/無効を取得 */
export function getCardDetailDisplayEnabled(): boolean {
  return get(cardDetailDisplayEnabled);
}

/** カード詳細表示機能の有効/無効を設定 */
export function setCardDetailDisplayEnabled(enabled: boolean) {
  cardDetailDisplayEnabled.set(enabled);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }
  // 無効にした場合は表示中のカードもクリア
  if (!enabled) {
    selectedCardForDisplay.set(null);
  }
}

/** カード詳細表示を表示する（機能が有効な場合のみ） */
export function showCardDetailDisplay(card: DisplayCardData) {
  if (get(cardDetailDisplayEnabled)) {
    selectedCardForDisplay.set(card);
  }
}

/** カード詳細表示を非表示にする */
export function hideCardDetailDisplay() {
  selectedCardForDisplay.set(null);
}
