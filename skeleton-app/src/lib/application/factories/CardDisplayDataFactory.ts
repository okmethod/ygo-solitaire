/**
 * CardDisplayDataFactory - CardDisplayData 生成ファクトリ
 *
 * CardData（Domain層）と ExternalCardData（外部API経由）を組み合わせて
 * UI表示用の CardDisplayData を生成する。
 *
 * @remarks
 * - ゲームロジックは、内部データ（Domain層のCardData）に従って動作する
 * - 外部データ（ExternalCardData）は表示用および検証用として用いる
 * - 内部データ/外部データに齟齬がある場合はワーニングを出力の上、内部データを優先する
 *
 * @module application/factories/CardDisplayDataFactory
 */

import type { ExternalCardData } from "$lib/application/ports/ICardDataRepository";
import type { CardDisplayData, CardType, MonsterAttributes } from "$lib/application/types/card";
import type { CardData } from "$lib/domain/models/Card";
import { getCardData } from "$lib/domain/registries/CardDataRegistry";

/** 外部APIの type 文字列を CardType に正規化する */
function normalizeExternalType(type: string): CardType | null {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";
  return null;
}

/** 外部APIの frameType 文字列を正規化する */
function normalizeExternalFrameType(frameType: string): string {
  return frameType.toLowerCase();
}

/**
 * Domain層と外部APIのデータを検証し、不一致があればワーニングを出力
 *
 * @remarks
 * ゲームはDomain層のデータに従って動作するが、
 * 手動で記述したDomain層データにミスがある可能性があるため、
 * 外部APIのデータと比較して不一致を検出する。
 */
function validateCardData(externalData: ExternalCardData, domainData: CardData): void {
  const cardName = `${domainData.jaName} (ID: ${domainData.id})`;

  // type の検証
  const externalType = normalizeExternalType(externalData.type);
  if (externalType && externalType !== domainData.type) {
    console.warn(
      `[CardData Mismatch] ${cardName}: type が一致しません。` +
        `Domain="${domainData.type}", API="${externalType}" (raw: "${externalData.type}")`,
    );
  }

  // frameType の検証
  const externalFrameType = normalizeExternalFrameType(externalData.frameType);
  if (externalFrameType !== domainData.frameType) {
    console.warn(
      `[CardData Mismatch] ${cardName}: frameType が一致しません。` +
        `Domain="${domainData.frameType}", API="${externalFrameType}" (raw: "${externalData.frameType}")`,
    );
  }
}

/** ExternalCardData と CardData から CardDisplayData を生成する */
function createCardDisplayData(externalData: ExternalCardData, domainData: CardData): CardDisplayData {
  // Domain層と外部APIのデータを検証
  validateCardData(externalData, domainData);

  // モンスターカード属性の変換（外部APIから取得）
  const monsterAttributes: MonsterAttributes | undefined =
    domainData.type === "monster" &&
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

  // CardDisplayData を生成
  return {
    id: domainData.id,
    name: externalData.name, // 外部データ
    jaName: domainData.jaName,
    type: domainData.type,
    description: externalData.desc, // 外部データ
    frameType: domainData.frameType,
    archetype: externalData.archetype, // 外部データ
    monsterAttributes, // 外部データ
    images: externalData.images ?? undefined, // 外部データ
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
