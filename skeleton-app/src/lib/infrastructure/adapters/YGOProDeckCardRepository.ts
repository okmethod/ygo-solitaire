import type { ICardDataRepository } from "$lib/application/ports/ICardDataRepository";
import type { CardDisplayData } from "$lib/presentation/types/card";
import { getCardsByIds as apiGetCardsByIds, getCardById as apiGetCardById } from "$lib/infrastructure/api/ygoprodeck";
import { convertToCardDisplayData } from "$lib/presentation/types/ygoprodeck";

/**
 * Adapter: YGOPRODeck APIを使用したカードデータ取得実装
 *
 * ICardDataRepositoryインターフェースの具象実装。
 * YGOPRODeck API v7との統合を提供。
 *
 * @remarks
 * - セッション単位のメモリキャッシュを実装（内部API関数が管理）
 * - 既存の `src/lib/infrastructure/api/ygoprodeck.ts` を内部的に利用
 */
export class YGOProDeckCardRepository implements ICardDataRepository {
	/**
	 * カードIDリストから複数のカードデータを取得
	 *
	 * @param cardIds - カードIDの配列
	 * @returns Promise<CardDisplayData[]> - カード表示データの配列
	 *
	 * @remarks
	 * - キャッシュチェックは内部API関数が管理
	 * - 未キャッシュIDのみAPIリクエスト（バッチ最適化）
	 * - YGOProDeckCard → CardDisplayData への変換を実施
	 */
	async getCardsByIds(cardIds: number[]): Promise<CardDisplayData[]> {
		const ygoprodeckCards = await apiGetCardsByIds(fetch, cardIds);
		return ygoprodeckCards.map(convertToCardDisplayData);
	}

	/**
	 * 単一のカードデータを取得
	 *
	 * @param cardId - カードID
	 * @returns Promise<CardDisplayData> - カード表示データ
	 */
	async getCardById(cardId: number): Promise<CardDisplayData> {
		const ygoprodeckCard = await apiGetCardById(fetch, cardId);
		if (!ygoprodeckCard) {
			throw new Error(`Card not found: ID ${cardId}`);
		}
		return convertToCardDisplayData(ygoprodeckCard);
	}
}
