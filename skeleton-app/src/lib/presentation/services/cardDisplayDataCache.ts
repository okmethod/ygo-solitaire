/**
 * cardDisplayDataCache - CardDisplayData のキャッシュサービス
 *
 * cardRepository（Infrastructure Layer）の利用を一箇所に集約し、
 * デッキ読み込み時に全カードの CardDisplayData を一括取得・キャッシュする。
 * 以降は同期的にデータを提供する。
 *
 * @architecture レイヤー間依存ルール - Presentation Layer (API Service)
 * - ROLE: Infrastructure Layer への依存を局所化し、表示用データのキャッシュを管理
 * - ALLOWED: Application Layer / Infrastructure Layer への依存
 * - FORBIDDEN: Domain Layer への直接依存
 *
 * @module presentation/services/cardDisplayDataCache
 */

import { writable, get } from "svelte/store";
import type { CardDisplayData } from "$lib/presentation/types";
import type { ICardDataRepository } from "$lib/application/ports/ICardDataRepository";
import { getCardDataRepository } from "$lib/infrastructure/adapters/YGOProDeckCardDataRepository";
import { createCardDisplayDataList } from "$lib/application/factories/CardDisplayDataFactory";

/** キャッシュの状態 */
interface CacheState {
  /** キャッシュが初期化済みかどうか */
  isInitialized: boolean;
  /** 初期化中かどうか */
  isLoading: boolean;
  /** エラーメッセージ（あれば） */
  error: string | null;
  /** キャッシュされた CardDisplayData（ID → データ） */
  data: Map<number, CardDisplayData>;
}

/** 初期状態 */
const initialState: CacheState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  data: new Map(),
};

/** キャッシュストア */
const cacheStore = writable<CacheState>(initialState);

/** cardRepository のシングルトンインスタンス（このモジュール内でのみ使用） */
const cardRepository: ICardDataRepository = getCardDataRepository();

/**
 * 指定されたカードIDリストで CardDisplayData を一括取得しキャッシュを初期化する
 *
 * @param cardIds - 取得するカードIDの配列
 * @returns 初期化が完了したら resolve する Promise
 */
export async function initializeCache(cardIds: number[]): Promise<void> {
  const currentState = get(cacheStore);

  // 既に初期化済みで、リクエストされた全てのIDがキャッシュにある場合はスキップ
  if (currentState.isInitialized && cardIds.every((id) => currentState.data.has(id))) {
    return;
  }

  // ローディング開始
  cacheStore.update((state) => ({
    ...state,
    isLoading: true,
    error: null,
  }));

  try {
    // 未キャッシュのIDのみ抽出
    const uncachedIds = cardIds.filter((id) => !currentState.data.has(id));

    if (uncachedIds.length > 0) {
      // API から一括取得
      const apiDataList = await cardRepository.getCardsByIds(fetch, uncachedIds);
      const displayDataList = createCardDisplayDataList(apiDataList);

      // キャッシュに追加
      cacheStore.update((state) => {
        const newData = new Map(state.data);
        displayDataList.forEach((card) => {
          newData.set(card.id, card);
        });
        return {
          ...state,
          isInitialized: true,
          isLoading: false,
          data: newData,
        };
      });
    } else {
      // 全て既にキャッシュ済み
      cacheStore.update((state) => ({
        ...state,
        isInitialized: true,
        isLoading: false,
      }));
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to initialize card display data cache";
    console.error("[cardDisplayDataCache] Initialization error:", err);
    cacheStore.update((state) => ({
      ...state,
      isLoading: false,
      error: errorMessage,
    }));
    throw err;
  }
}

/** キャッシュから指定カードIDの CardDisplayData を取得 */
export function getCardDisplayData(cardId: number): CardDisplayData | undefined {
  const state = get(cacheStore);
  return state.data.get(cardId);
}

/** キャッシュから複数カードIDの CardDisplayData を取得 */
export function getCardDisplayDataList(cardIds: number[]): CardDisplayData[] {
  const state = get(cacheStore);
  return cardIds.map((id) => state.data.get(id)).filter((card): card is CardDisplayData => card !== undefined);
}

/**
 * キャッシュの状態を取得するストア
 *
 * リアクティブに状態変化を購読できる
 */
export const cardDisplayDataCacheStore = {
  subscribe: cacheStore.subscribe,
  /** キャッシュが初期化済みかどうか */
  get isInitialized() {
    return get(cacheStore).isInitialized;
  },
  /** 初期化中かどうか */
  get isLoading() {
    return get(cacheStore).isLoading;
  },
  /** エラーメッセージ */
  get error() {
    return get(cacheStore).error;
  },
};

/** キャッシュをクリアする（テスト用） */
export function clearCache(): void {
  cacheStore.set(initialState);
}
