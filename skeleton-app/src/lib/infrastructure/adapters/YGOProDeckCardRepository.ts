/**
 * Adapter: YGOPRODeck APIを使用したカードデータ取得実装
 *
 * ICardDataRepositoryインターフェースの具象実装。
 * YGOPRODeck API v7との統合を提供。
 *
 * @remarks
 * - セッション単位のメモリキャッシュを実装
 * - キャッシュチェックは内部API関数が管理
 * - 未キャッシュIDのみAPIリクエスト（バッチ最適化）
 * - Singletonパターンで単一インスタンスを共有（getCardRepository経由で取得）
 *
 * @module infrastructure/adapters/YGOProDeckCardRepository
 */

import type { ICardDataRepository, ExternalCardData } from "$lib/application/ports/ICardDataRepository";
import { getCardsByIds as apiGetCardsByIds, getCardById as apiGetCardById } from "$lib/infrastructure/api/ygoprodeck";

/** カード情報取得の具象実装 (YGOProDeck API) */
class YGOProDeckCardRepository implements ICardDataRepository {
  /** カードIDリストから複数のカードデータを取得 */
  async getCardsByIds(fetchFunction: typeof fetch, cardIds: number[]): Promise<ExternalCardData[]> {
    return apiGetCardsByIds(fetchFunction, cardIds);
  }

  /** 単一のカードデータを取得 */
  async getCardById(fetchFunction: typeof fetch, cardId: number): Promise<ExternalCardData> {
    const card = await apiGetCardById(fetchFunction, cardId);
    if (!card) {
      throw new Error(`Card not found: ID ${cardId}`);
    }
    return card;
  }
}

// Singleton インスタンス
let cardRepositoryInstance: ICardDataRepository | null = null;

/**
 * Singleton getter
 *
 * Application Layerから利用する統一アクセスポイント。
 * 単一のYGOProDeckCardRepositoryインスタンスを共有し、効率的なキャッシュ管理を実現。
 */
export function getCardRepository(): ICardDataRepository {
  if (!cardRepositoryInstance) {
    cardRepositoryInstance = new YGOProDeckCardRepository();
  }
  return cardRepositoryInstance;
}
