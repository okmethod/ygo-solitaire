/**
 * YGOProDeckCardDataRepository - Port/Adapter パターンの Adapter (具象実装)
 *
 * YGOPRODeck API v7 との統合を提供する。
 *
 * @remarks
 * - セッション単位のメモリキャッシュを実装
 * - キャッシュチェックは内部API関数が管理
 * - 未キャッシュIDのみAPIリクエスト（バッチ最適化）
 * - Singletonパターンで単一インスタンスを共有
 *
 * @architecture  レイヤー間依存ルール - インフラ層 (Adapter)
 * - ROLE: Port に従った具体的な技術実装（API通信、キャッシュ、外部ライブラリ）
 * - ALLOWED: アプリ層の Port への依存
 * - FORBIDDEN: ドメイン層への直接依存
 *
 * @module infrastructure/adapters/YGOProDeckCardDataRepository
 */

import type { ICardDataRepository, ExternalCardData } from "$lib/application/ports/ICardDataRepository";
import { getCardsByIds as apiGetCardsByIds, getCardById as apiGetCardById } from "$lib/infrastructure/api/ygoprodeck";

/** カード情報取得の具象実装 (YGOProDeck API) */
class YGOProDeckCardDataRepository implements ICardDataRepository {
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
let repositoryInstance: ICardDataRepository | null = null;

/**
 * Singleton getter
 *
 * アプリ層から利用する統一アクセスポイント。
 * 単一のYGOProDeckCardDataRepositoryインスタンスを共有し、効率的なキャッシュ管理を実現。
 */
export function getCardDataRepository(): ICardDataRepository {
  if (!repositoryInstance) {
    repositoryInstance = new YGOProDeckCardDataRepository();
  }
  return repositoryInstance;
}
