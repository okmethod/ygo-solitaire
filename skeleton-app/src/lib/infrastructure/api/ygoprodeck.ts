import { constructRequestInit, fetchApi } from "$lib/shared/utils/request";
import type { YGOProDeckCard } from "$lib/presentation/types/ygoprodeck";

interface YGOProDeckResponseJson {
  data: YGOProDeckCard[];
}

const API_BASE_URL = "https://db.ygoprodeck.com/api/v7";

/**
 * YGOPRODeck APIレスポンスのメモリキャッシュ
 *
 * セッション単位でカードデータをキャッシュし、重複リクエストを防ぐ。
 * ライフサイクル: ページリロードまで（メモリ上のみ）
 */
const cardCache = new Map<number, YGOProDeckCard>();

/**
 * キャッシュをクリアする（テスト用）
 *
 * @internal
 */
export function clearCache(): void {
  cardCache.clear();
}

/**
 * YGOPRODeck APIへのリクエストを実行
 *
 * @param {typeof fetch} fetchFunction - fetchインスタンス
 * @param {string} path - APIパス
 * @returns {Promise<YGOProDeckResponseJson | null>} APIレスポンス（エラー時はnull）
 * @throws {Error} Rate limit exceeded (429)
 */
async function fetchYGOProDeckAPI(fetchFunction: typeof fetch, path: string): Promise<YGOProDeckResponseJson | null> {
  const requestInit = constructRequestInit();
  const requestConfig = {
    ...requestInit,
    method: "GET",
  };
  const url = `${API_BASE_URL}/${path}`;

  try {
    const response = await fetchApi(fetchFunction, url, requestConfig);

    if (!response.ok) {
      // エラー詳細をログ出力
      console.error(`YGOPRODeck API Error: ${response.status} ${response.statusText} - ${url}`);

      // Rate limit検出（429 Too Many Requests）
      if (response.status === 429) {
        throw new Error("YGOPRODeck API rate limit exceeded. Please reduce request frequency.");
      }

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("YGOPRODeck API fetch failed:", error);
    throw error;
  }
}

export async function getCardById(fetchFunction: typeof fetch, id: number): Promise<YGOProDeckCard | null> {
  const path = `cardinfo.php?id=${id}`;
  const data = await fetchYGOProDeckAPI(fetchFunction, path);
  return data?.data[0] || null;
}

/**
 * カードIDのリストから複数のカードデータを取得
 *
 * キャッシュを優先的に使用し、未キャッシュのカードのみAPIリクエスト。
 *
 * @param {typeof fetch} fetchFunction - fetchインスタンス
 * @param {number[]} ids - カードIDのリスト
 * @returns {Promise<YGOProDeckCard[]>} カードデータのリスト
 *
 * @example
 * // キャッシュヒット率の向上（バッチリクエスト）
 * const cards = await getCardsByIds(fetch, [33396948, 70903634, 7902349]);
 */
export async function getCardsByIds(fetchFunction: typeof fetch, ids: number[]): Promise<YGOProDeckCard[]> {
  if (ids.length === 0) return [];

  // キャッシュヒット/ミスを分離
  const cachedCards: YGOProDeckCard[] = [];
  const uncachedIds: number[] = [];

  for (const id of ids) {
    const cached = cardCache.get(id);
    if (cached) {
      cachedCards.push(cached);
    } else {
      uncachedIds.push(id);
    }
  }

  // 未キャッシュのカードのみAPIリクエスト
  let fetchedCards: YGOProDeckCard[] = [];
  if (uncachedIds.length > 0) {
    const idsString = uncachedIds.join(",");
    const path = `cardinfo.php?id=${idsString}`;
    const data = await fetchYGOProDeckAPI(fetchFunction, path);

    if (data?.data) {
      fetchedCards = data.data;

      // 取得したカードをキャッシュに保存
      for (const card of fetchedCards) {
        cardCache.set(card.id, card);
      }
    }
  }

  // キャッシュカード + 新規取得カードを結合
  return [...cachedCards, ...fetchedCards];
}

export async function searchCardsByName(fetchFunction: typeof fetch, name: string): Promise<YGOProDeckCard[]> {
  const encodedName = encodeURIComponent(name);
  const path = `cardinfo.php?fname=${encodedName}`;
  const data = await fetchYGOProDeckAPI(fetchFunction, path);
  return data?.data || [];
}
