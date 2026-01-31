import { z } from "zod";
import type { ExternalCardData } from "$lib/application/ports/ICardDataRepository";
import { constructRequestInit, fetchApi } from "$lib/infrastructure/utils/request";

// ============================================================================
// YGOProDeck API レスポンスの Zod スキーマ定義
// ============================================================================

/** カード画像情報スキーマ */
const YGOProCardImageSchema = z.object({
  id: z.number(),
  image_url: z.string(),
  image_url_small: z.string(),
  image_url_cropped: z.string(),
});

/** カード収録パック情報スキーマ */
const YGOProCardSetSchema = z.object({
  set_name: z.string(),
  set_code: z.string(),
  set_rarity: z.string(),
  set_rarity_code: z.string(),
  set_price: z.string(),
});

/** カード価格情報スキーマ */
const YGOProCardPriceSchema = z.object({
  cardmarket_price: z.string(),
  tcgplayer_price: z.string(),
  ebay_price: z.string(),
  amazon_price: z.string(),
  coolstuffinc_price: z.string(),
});

/** 禁止制限情報スキーマ */
const YGOProBanlistInfoSchema = z.object({
  ban_tcg: z.string().optional(),
  ban_ocg: z.string().optional(),
  ban_goat: z.string().optional(),
});

/** カード情報スキーマ (YGOProDeck API) */
const YGOProDeckCardInfoSchema = z.object({
  // 基本情報（全カード共通）
  id: z.number(),
  name: z.string(),
  type: z.string(),
  humanReadableCardType: z.string(),
  frameType: z.string(),
  desc: z.string(),
  race: z.string(),
  ygoprodeck_url: z.string(),

  // オプション（カードによって有無が異なる）
  archetype: z.string().optional(),
  typeline: z.array(z.string()).optional(),

  // モンスター専用
  atk: z.number().optional(),
  def: z.number().optional(),
  level: z.number().optional(),
  attribute: z.string().optional(),

  // 付加情報
  banlist_info: YGOProBanlistInfoSchema.optional(),
  card_images: z.array(YGOProCardImageSchema),
  card_sets: z.array(YGOProCardSetSchema).optional(),
  card_prices: z.array(YGOProCardPriceSchema).optional(),
});

/** APIレスポンス全体のスキーマ */
const YGOProDeckResponseSchema = z.object({
  data: z.array(YGOProDeckCardInfoSchema),
});

/** YGOProDeck API カード情報型（Infrastructure層内部用） */
type YGOProDeckCardInfo = z.infer<typeof YGOProDeckCardInfoSchema>;

/**
 * YGOProDeckCardInfo を ExternalCardData に変換
 *
 * Infrastructure層内部の型からApplication層が期待する型へ変換する。
 */
function toExternalCardData(apiData: YGOProDeckCardInfo): ExternalCardData {
  const cardImage = apiData.card_images[0];

  return {
    id: apiData.id,
    name: apiData.name,
    type: apiData.type,
    frameType: apiData.frameType,
    desc: apiData.desc,
    archetype: apiData.archetype,
    atk: apiData.atk,
    def: apiData.def,
    level: apiData.level,
    attribute: apiData.attribute,
    race: apiData.type.toLowerCase().includes("monster") ? apiData.race : undefined,
    images: cardImage
      ? {
          image: cardImage.image_url,
          imageSmall: cardImage.image_url_small,
          imageCropped: cardImage.image_url_cropped,
        }
      : null,
  };
}

// ============================================================================
// YGOProDeck API クライアント実装
// ============================================================================

const API_BASE_URL = "https://db.ygoprodeck.com/api/v7";
const CARD_INFO_ENDPOINT = "cardinfo.php";

/**
 * YGOPRODeck APIレスポンスのメモリキャッシュ
 *
 * セッション単位でカードデータをキャッシュし、重複リクエストを防ぐ。
 * ライフサイクル: ページリロードまで（メモリ上のみ）
 */
const cardCache = new Map<number, YGOProDeckCardInfo>();

/**
 * キャッシュをクリアする（テスト用）
 *
 * @internal
 */
export function clearCache(): void {
  cardCache.clear();
}

/** YGOProDeck API レスポンス型 */
type YGOProDeckResponse = z.infer<typeof YGOProDeckResponseSchema>;

/**
 * YGOPRODeck APIへのリクエストを実行
 *
 * @param {typeof fetch} fetchFunction - fetchインスタンス
 * @param {string} path - APIパス
 * @returns {Promise<YGOProDeckResponse | null>} APIレスポンス（エラー時はnull）
 * @throws {Error} Rate limit exceeded (429)
 * @throws {Error} Zodバリデーションエラー
 */
async function fetchYGOProDeckAPI(fetchFunction: typeof fetch, path: string): Promise<YGOProDeckResponse | null> {
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

    const json = await response.json();
    // Zodでバリデーション
    return YGOProDeckResponseSchema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("YGOPRODeck API response validation failed:", error.issues);
    } else {
      console.error("YGOPRODeck API fetch failed:", error);
    }
    throw error;
  }
}

/** カードIDからカードデータを取得する */
export async function getCardById(fetchFunction: typeof fetch, id: number): Promise<ExternalCardData | null> {
  const path = `${CARD_INFO_ENDPOINT}?id=${id}`;
  const data = await fetchYGOProDeckAPI(fetchFunction, path);
  const apiData = data?.data[0];
  return apiData ? toExternalCardData(apiData) : null;
}

/** カードIDのリストから複数のカードデータを取得する */
export async function getCardsByIds(fetchFunction: typeof fetch, ids: number[]): Promise<ExternalCardData[]> {
  if (ids.length === 0) return [];

  // キャッシュヒット/ミスを分離
  const cachedCards: YGOProDeckCardInfo[] = [];
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
  let fetchedCards: YGOProDeckCardInfo[] = [];
  if (uncachedIds.length > 0) {
    const idsString = uncachedIds.join(",");
    const path = `${CARD_INFO_ENDPOINT}?id=${idsString}`;
    const data = await fetchYGOProDeckAPI(fetchFunction, path);

    if (data?.data) {
      fetchedCards = data.data;

      // 取得したカードをキャッシュに保存
      for (const card of fetchedCards) {
        cardCache.set(card.id, card);
      }
    }
  }

  // キャッシュカード + 新規取得カードを結合し、ExternalCardDataに変換
  return [...cachedCards, ...fetchedCards].map(toExternalCardData);
}

/** カード名でカードデータを検索する */
export async function searchCardsByName(fetchFunction: typeof fetch, name: string): Promise<ExternalCardData[]> {
  const encodedName = encodeURIComponent(name);
  const path = `${CARD_INFO_ENDPOINT}?fname=${encodedName}`;
  const data = await fetchYGOProDeckAPI(fetchFunction, path);
  return data?.data.map(toExternalCardData) || [];
}
