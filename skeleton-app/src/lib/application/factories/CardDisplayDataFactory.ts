/**
 * CardDisplayDataFactory - CardDisplayData 生成ファクトリ
 *
 * CardData（Domain層）と ExternalCardData（外部API経由）を組み合わせて
 * UI表示用の CardDisplayData を生成する。
 *
 * @module application/factories/CardDisplayDataFactory
 */

import type { ExternalCardData } from "$lib/application/ports/ICardDataRepository";
import type { CardDisplayData, CardType, MonsterAttributes } from "$lib/application/types/card";
import type { CardData } from "$lib/domain/models/Card";
import { getCardData } from "$lib/domain/registries/CardDataRegistry";

/**
 * CardType を正規化する
 *
 * 外部APIの type 文字列を CardType に変換
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

/** ExternalCardData と CardData から CardDisplayData を生成する */
function createCardDisplayData(externalData: ExternalCardData, domainData: CardData): CardDisplayData {
  const cardType = normalizeCardType(externalData.type);

  // モンスターカード属性の変換
  const monsterAttributes: MonsterAttributes | undefined =
    cardType === "monster" &&
    externalData.atk !== undefined &&
    externalData.def !== undefined &&
    externalData.level !== undefined
      ? {
          attack: externalData.atk,
          defense: externalData.def,
          level: externalData.level,
          attribute: externalData.attribute ?? "",
          race: externalData.race ?? "",
        }
      : undefined;

  return {
    id: externalData.id,
    name: externalData.name,
    jaName: domainData.jaName,
    type: cardType,
    description: externalData.desc,
    frameType: externalData.frameType,
    archetype: externalData.archetype,
    monsterAttributes,
    images: externalData.images ?? undefined,
  };
}

/**
 * ExternalCardData から CardDisplayData を生成する
 *
 * @throws Error - 指定カードが CardDataRegistry に登録されていない場合
 */
export function createCardDisplayDataFromApi(externalData: ExternalCardData): CardDisplayData {
  const domainData = getCardData(externalData.id);
  return createCardDisplayData(externalData, domainData);
}

/**
 * 複数の ExternalCardData から CardDisplayData の配列を生成する
 *
 * @throws Error - 指定カードが CardDataRegistry に登録されていない場合
 */
export function createCardDisplayDataList(externalDataList: ExternalCardData[]): CardDisplayData[] {
  return externalDataList.map((externalData) => createCardDisplayDataFromApi(externalData));
}
