/**
 * appSecretStore - あいことば（APIシークレット）の状態管理
 *
 * localStorage に永続化し、LLM を使用する機能で認証ヘッダーに利用する。
 */

import { browser } from "$app/env";
import { writable, get } from "svelte/store";

const STORAGE_KEY = "app_secret";

function createAppSecretStore() {
  const initial = browser ? (localStorage.getItem(STORAGE_KEY) ?? "") : "";
  const { subscribe, set } = writable<string>(initial);

  return {
    subscribe,
    /** あいことばを保存する */
    setSecret(secret: string): void {
      if (browser) localStorage.setItem(STORAGE_KEY, secret);
      set(secret);
    },
    /** あいことばを削除する（再認証を促す） */
    clearSecret(): void {
      if (browser) localStorage.removeItem(STORAGE_KEY);
      set("");
    },
  };
}

export const appSecretStore = createAppSecretStore();

/** あいことばを取得する（非リアクティブ、リクエスト時点の値を使用） */
export function getAppSecret(): string {
  return get(appSecretStore);
}
