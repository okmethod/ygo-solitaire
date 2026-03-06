/**
 * chainConfirmationStore - チェーン確認の有効/無効を管理するストア
 *
 * 有効の場合: チェーン確認モーダルが表示される
 * 無効の場合: チェーン確認モーダルが表示されない（常にPASS）
 */

import { writable, get } from "svelte/store";

const STORAGE_KEY = "chainConfirmationEnabled";

/** チェーン確認機能の有効/無効状態 */
export const chainConfirmationEnabled = writable<boolean>(loadEnabledState());

/** ローカルストレージから有効状態を読み込む */
function loadEnabledState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored === "true";
  }
  // 初回アクセス時: デフォルトは有効
  return true;
}

/** チェーン確認機能の有効/無効を取得 */
export function getChainConfirmationEnabled(): boolean {
  return get(chainConfirmationEnabled);
}

/** チェーン確認機能の有効/無効を設定 */
export function setChainConfirmationEnabled(enabled: boolean) {
  chainConfirmationEnabled.set(enabled);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }
}
