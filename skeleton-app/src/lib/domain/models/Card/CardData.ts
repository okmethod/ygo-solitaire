/**
 * CardData - 「カード1種類」を表現するモデル
 */

/** カードタイプ */
export const CARD_TYPES = ["monster", "spell", "trap"] as const;
export type CardType = (typeof CARD_TYPES)[number];

/** メインデッキ向けモンスターサブタイプ */
export const MAIN_MONSTER_SUB_TYPES = ["normal", "effect", "ritual", "pendulum"] as const;
export type MainMonsterSubType = (typeof MAIN_MONSTER_SUB_TYPES)[number];

/** エクストラデッキ向けモンスターサブタイプ */
export const EXTRA_MONSTER_SUB_TYPES = ["fusion", "synchro", "xyz", "link"] as const;
export type ExtraMonsterSubType = (typeof EXTRA_MONSTER_SUB_TYPES)[number];

/** カードフレームタイプ */
export const FRAME_SUB_TYPES = [...MAIN_MONSTER_SUB_TYPES, ...EXTRA_MONSTER_SUB_TYPES, "spell", "trap"] as const;
export type FrameSubType = (typeof FRAME_SUB_TYPES)[number];

/** 魔法カードサブタイプ */
export const SPELL_SUB_TYPES = ["normal", "quick-play", "continuous", "field", "equip", "ritual"] as const;
export type SpellSubType = (typeof SPELL_SUB_TYPES)[number];

/** 罠カードサブタイプ */
export const TRAP_SUB_TYPES = ["normal", "continuous", "counter"] as const;
export type TrapSubType = (typeof TRAP_SUB_TYPES)[number];

/** エディション */
export const EDITIONS = ["latest", "legacy"] as const;
export type Edition = (typeof EDITIONS)[number]; // latest: 最新, legacy: エラッタ前

/**
 * 1種類のカードデータ（定義情報）
 *
 * ゲームロジック実装に必要なプロパティのみを保持。
 * 画像等の表示用データは含まない。
 */
export interface CardData {
  readonly id: number; // カードデータを一意に識別するID（YGOProDeck APIと同じ値）
  readonly jaName: string; // 日本語カード名（YGOProDeck APIの name は英語名）
  readonly type: CardType;
  readonly frameType: FrameSubType;
  readonly spellType?: SpellSubType;
  readonly trapType?: TrapSubType;

  // エディション
  readonly edition: Edition; // "legacy" | "latest"(デフォルト)

  // モンスターカードのみ
  readonly level?: number; // レベル
  readonly attack?: number;
  readonly defense?: number;
}

/**
 * 《》付きでカード名を取得する
 *
 * @example 《強欲な壺》
 */
export const nameWithBrackets = (card: CardData): string => {
  return `《${card.jaName}》`;
};

/** モンスターカードかどうか */
export const isMonsterCard = (card: CardData): boolean => {
  return card.type === "monster";
};

/** 魔法カードかどうか */
export const isSpellCard = (card: CardData): boolean => {
  return card.type === "spell";
};

/** 通常魔法カードかどうか */
export const isNormalSpellCard = (card: CardData): boolean => {
  return isSpellCard(card) && card.spellType === "normal";
};

/** 速攻魔法カードかどうか */
export const isQuickPlaySpellCard = (card: CardData): boolean => {
  return isSpellCard(card) && card.spellType === "quick-play";
};

/** 永続魔法カードかどうか */
export const isContinuousSpellCard = (card: CardData): boolean => {
  return isSpellCard(card) && card.spellType === "continuous";
};

/** フィールド魔法カードかどうか */
export const isFieldSpellCard = (card: CardData): boolean => {
  return isSpellCard(card) && card.spellType === "field";
};

/** 装備魔法カードかどうか */
export const isEquipSpellCard = (card: CardData): boolean => {
  return isSpellCard(card) && card.spellType === "equip";
};

/** 罠カードかどうか */
export const isTrapCard = (card: CardData): boolean => {
  return card.type === "trap";
};

/** レガシー版かどうか */
export const isLegacyEdition = (card: CardData): boolean => {
  return card.edition === "legacy";
};

/** カードタイプの日本語変換 */
const CARD_TYPE_NAMES: Record<CardType, string> = {
  spell: "魔法",
  monster: "モンスター",
  trap: "罠",
};

/** フレームタイプの日本語変換 */
const FRAME_TYPE_NAMES: Record<FrameSubType, string> = {
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
const SPELL_TYPE_NAMES: Record<SpellSubType, string> = {
  field: "フィールド",
  normal: "通常",
  "quick-play": "速攻",
  continuous: "永続",
  equip: "装備",
  ritual: "儀式",
};

/** 罠カード種別の日本語変換 */
const TRAP_TYPE_NAMES: Record<TrapSubType, string> = {
  normal: "通常",
  continuous: "永続",
  counter: "カウンター",
};

/**
 * カードタイプを日本語に変換する
 *
 * 例:
 * - { type: "spell", spellType: "field" } -> "フィールド魔法"
 * - { type: "monster", frameType: "fusion" } -> "融合モンスター"
 * - { type: "trap", trapType: "counter" } -> "カウンター罠"
 */
export function buildJapaneseCardTypeDesc(
  type: CardType,
  frameType?: FrameSubType,
  spellType?: SpellSubType,
  trapType?: TrapSubType,
): string {
  const parts: string[] = [];

  if (frameType) {
    parts.push(FRAME_TYPE_NAMES[frameType] ?? frameType);
  }
  if (spellType) {
    parts.push(SPELL_TYPE_NAMES[spellType] ?? spellType);
  }
  if (trapType) {
    parts.push(TRAP_TYPE_NAMES[trapType] ?? trapType);
  }

  const typeJa = CARD_TYPE_NAMES[type] ?? type;
  parts.push(typeJa);

  return parts.join("");
}
