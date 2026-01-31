/**
 * CardDisplayDataFactory - CardDisplayData 生成ファクトリ
 *
 * CardData（Domain層）と YGOProDeckCardInfo（API経由）を組み合わせて
 * UI表示用の CardDisplayData を生成する。
 *
 * @module application/factories/CardDisplayDataFactory
 */

import type { YGOProDeckCardInfo } from "$lib/application/ports/ICardDataRepository";
import type { CardDisplayData, CardType, CardImages, MonsterAttributes } from "$lib/application/types/card";
import type { CardData } from "$lib/domain/models/Card";
import { getCardData } from "$lib/domain/registries/CardDataRegistry";

/**
 * CardType を正規化する
 *
 * YGOProDeck API の type 文字列を CardType に変換
 */
function normalizeCardType(type: string): CardType {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";

  console.error(`Unknown card type: ${type}`);
  throw new Error(
    `Unable to normalize card type: "${type}". ` + `Expected type containing "monster", "spell", or "trap".`,
  );
}

/** YGOProDeckCardInfo と CardData から CardDisplayData を生成する */
function createCardDisplayData(apiData: YGOProDeckCardInfo, domainData: CardData): CardDisplayData {
  const cardType = normalizeCardType(apiData.type);
  const cardImage = apiData.card_images[0];

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
    cardType === "monster" && apiData.atk !== undefined && apiData.def !== undefined && apiData.level !== undefined
      ? {
          attack: apiData.atk,
          defense: apiData.def,
          level: apiData.level,
          attribute: apiData.attribute ?? "",
          race: apiData.race ?? "",
        }
      : undefined;

  return {
    id: apiData.id,
    name: apiData.name,
    jaName: domainData.jaName,
    type: cardType,
    description: apiData.desc,
    frameType: apiData.frameType,
    archetype: apiData.archetype,
    monsterAttributes,
    images,
  };
}

/**
 * YGOProDeckCardInfo から CardDisplayData を生成する
 *
 * @throws Error - 指定カードが CardDataRegistry に登録されていない場合
 */
export function createCardDisplayDataFromApi(apiData: YGOProDeckCardInfo): CardDisplayData {
  const domainData = getCardData(apiData.id);
  return createCardDisplayData(apiData, domainData);
}

/**
 * 複数の YGOProDeckCardInfo から CardDisplayData の配列を生成する
 * 
 * @throws Error - 指定カードが CardDataRegistry に登録されていない場合
 */
export function createCardDisplayDataList(apiDataList: YGOProDeckCardInfo[]): CardDisplayData[] {
  return apiDataList.map((apiData) => createCardDisplayDataFromApi(apiData));
}
