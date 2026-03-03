/**
 * 日本語変換マップ
 */

import type { CardType, FrameSubType, SpellSubType, TrapSubType } from "$lib/domain/models/Card";

/** カードタイプの日本語変換 */
export const cardTypeToJapanese: Record<CardType, string> = {
  spell: "魔法",
  monster: "モンスター",
  trap: "罠",
};

/** フレームタイプの日本語変換 */
export const frameTypeToJapanese: Record<FrameSubType, string> = {
  normal: "通常",
  effect: "効果",
  fusion: "融合",
  ritual: "儀式",
  pendulum: "ペンデュラム",
  synchro: "シンクロ",
  xyz: "エクシーズ",
  link: "リンク",
  spell: "魔法",
  trap: "罠",
};

/** 魔法カード種別の日本語変換 */
export const spellTypeToJapanese: Record<SpellSubType, string> = {
  field: "フィールド",
  normal: "通常",
  "quick-play": "速攻",
  continuous: "永続",
  equip: "装備",
  ritual: "儀式",
};

/** 罠カード種別の日本語変換 */
export const trapTypeToJapanese: Record<TrapSubType, string> = {
  normal: "通常",
  continuous: "永続",
  counter: "カウンター",
};

/**
 * フィルター条件を日本語に変換する
 *
 * 例: { filterType: "spell", filterSpellType: "field" } -> "フィールド魔法"
 * 例: { filterType: "monster", filterFrameType: "fusion" } -> "融合モンスター"
 * 例: { filterType: "trap" } -> "罠"
 */
export function buildJapaneseFilterDesc(
  filterType: CardType,
  filterSpellType?: SpellSubType,
  filterFrameType?: FrameSubType,
): string {
  const parts: string[] = [];

  if (filterFrameType) {
    parts.push(frameTypeToJapanese[filterFrameType] ?? filterFrameType);
  }
  if (filterSpellType) {
    parts.push(spellTypeToJapanese[filterSpellType] ?? filterSpellType);
  }

  const typeJa = cardTypeToJapanese[filterType] ?? filterType;
  parts.push(typeJa);

  return parts.join("");
}
