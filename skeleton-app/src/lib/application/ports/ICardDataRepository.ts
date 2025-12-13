import type { CardDisplayData } from "$lib/presentation/types/card";

/**
 * Port: カードデータ取得の抽象インターフェース
 *
 * Application Layerが依存する契約を定義。
 * Infrastructure Layerが具象実装を提供。
 *
 * @remarks
 * - テスト時にモック実装を注入可能
 * - 将来的に別のカードAPI（ローカルストレージ、FastAPI等）への切り替えが容易
 * - YGOPRODeck APIの実装詳細から完全に分離
 */
export interface ICardDataRepository {
	/**
	 * カードIDリストから複数のカードデータを取得
	 *
	 * @param cardIds - カードIDの配列（YGOPRODeck API互換の数値ID）
	 * @returns Promise<CardDisplayData[]> - カード表示データの配列
	 *
	 * @remarks
	 * - バッチリクエストにより複数カードを一度に取得
	 * - 実装側でキャッシングを行う想定
	 * - 存在しないIDがあった場合のエラーハンドリングは実装に委ねる
	 */
	getCardsByIds(cardIds: number[]): Promise<CardDisplayData[]>;

	/**
	 * 単一のカードデータを取得
	 *
	 * @param cardId - カードID（YGOPRODeck API互換の数値ID）
	 * @returns Promise<CardDisplayData> - カード表示データ
	 *
	 * @remarks
	 * - 内部的には getCardsByIds([cardId]) を呼び出す想定
	 */
	getCardById(cardId: number): Promise<CardDisplayData>;
}
