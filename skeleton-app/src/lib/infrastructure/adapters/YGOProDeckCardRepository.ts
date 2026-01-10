import type { ICardDataRepository } from "$lib/application/ports/ICardDataRepository";
import type { CardDisplayData, CardType, CardImages, MonsterAttributes } from "$lib/application/types/card";
import type { YGOProDeckCard } from "$lib/infrastructure/types/ygoprodeck";
import { getCardsByIds as apiGetCardsByIds, getCardById as apiGetCardById } from "$lib/infrastructure/api/ygoprodeck";

/**
 * Adapter: YGOPRODeck APIを使用したカードデータ取得実装
 *
 * ICardDataRepositoryインターフェースの具象実装。
 * YGOPRODeck API v7との統合を提供。
 *
 * @remarks
 * - セッション単位のメモリキャッシュを実装（内部API関数が管理）
 * - 既存の `src/lib/infrastructure/api/ygoprodeck.ts` を内部的に利用
 * - YGOProDeckCard → CardDisplayData への変換をprivateメソッドで実施
 * - Singletonパターンで単一インスタンスを共有（getCardRepository経由で取得）
 */
class YGOProDeckCardRepository implements ICardDataRepository {
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
    return ygoprodeckCards.map((card) => this.convertToCardDisplayData(card));
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
    return this.convertToCardDisplayData(ygoprodeckCard);
  }

  /**
   * カードタイプを正規化する内部関数
   *
   * YGOPRODeck APIのtype文字列をCardTypeに変換
   * @param {string} type - YGOPRODeck APIのtype文字列
   * @returns {CardType} 正規化されたカードタイプ
   * @throws {Error} 未知のカードタイプ
   */
  private normalizeType(type: string): CardType {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("monster")) return "monster";
    if (lowerType.includes("spell")) return "spell";
    if (lowerType.includes("trap")) return "trap";

    // 未知のカードタイプはエラーとして扱う
    console.error(`Unknown card type: ${type}`);
    throw new Error(
      `Unable to normalize card type: "${type}". ` + `Expected type containing "monster", "spell", or "trap".`,
    );
  }

  /**
   * YGOPRODeck API カードデータをCardDisplayDataに変換
   *
   * Infrastructure層の責務として、外部API型をApplication層のDTOに変換。
   *
   * @param apiCard - YGOPRODeck APIから取得したカードデータ
   * @returns CardDisplayData - Application層のDTO
   */
  private convertToCardDisplayData(apiCard: YGOProDeckCard): CardDisplayData {
    const cardType = this.normalizeType(apiCard.type);
    const cardImage = apiCard.card_images[0];

    // 画像データの変換
    const images: CardImages | undefined = cardImage
      ? {
          image: cardImage.image_url,
          imageSmall: cardImage.image_url_small,
          imageCropped: cardImage.image_url_cropped,
        }
      : undefined;

    // モンスターカード属性の変換
    const monsterAttributes: MonsterAttributes | undefined =
      cardType === "monster" && apiCard.atk !== undefined && apiCard.def !== undefined && apiCard.level !== undefined
        ? {
            attack: apiCard.atk,
            defense: apiCard.def,
            level: apiCard.level,
            attribute: apiCard.attribute ?? "",
            race: apiCard.race ?? "",
          }
        : undefined;

    return {
      id: apiCard.id,
      name: apiCard.name,
      type: cardType,
      description: apiCard.desc,
      frameType: apiCard.frameType,
      archetype: apiCard.archetype,
      monsterAttributes,
      images,
    };
  }
}

/**
 * Singleton instance
 */
let cardRepositoryInstance: ICardDataRepository | null = null;

/**
 * CardRepository Singleton getter
 *
 * Application Layerから利用する統一アクセスポイント。
 * 単一のYGOProDeckCardRepositoryインスタンスを共有し、効率的なキャッシュ管理を実現。
 *
 * @returns ICardDataRepository - Singletonインスタンス
 * ```
 */
export function getCardRepository(): ICardDataRepository {
  if (!cardRepositoryInstance) {
    cardRepositoryInstance = new YGOProDeckCardRepository();
  }
  return cardRepositoryInstance;
}
