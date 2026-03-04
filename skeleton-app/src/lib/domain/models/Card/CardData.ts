/**
 * CardData - 「カード1種類」を表現するモデル
 */

/** カードタイプ */
export type CardType = "monster" | "spell" | "trap";

/** メインデッキ向けモンスターサブタイプ */
export type MainMonsterSubType = "normal" | "effect" | "ritual" | "pendulum";
/** エクストラデッキ向けモンスターサブタイプ */
export type ExtraMonsterSubType = "fusion" | "synchro" | "xyz" | "link";
/** カードフレームタイプ */
export type FrameSubType = MainMonsterSubType | ExtraMonsterSubType | "spell" | "trap";
/** 魔法カードサブタイプ */
export type SpellSubType = "normal" | "quick-play" | "continuous" | "field" | "equip" | "ritual";
/** 罠カードサブタイプ */
export type TrapSubType = "normal" | "continuous" | "counter";

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

  // モンスターカードのみ
  readonly level?: number; // レベル
  // readonly attack?: number;
  // readonly defense?: number;
}

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
  return card.type === "spell" && card.spellType === "normal";
};

/** 速攻魔法カードかどうか */
export const isQuickPlaySpellCard = (card: CardData): boolean => {
  return card.type === "spell" && card.spellType === "quick-play";
};

/** フィールド魔法カードかどうか */
export const isFieldSpellCard = (card: CardData): boolean => {
  return card.type === "spell" && card.spellType === "field";
};

/** 罠カードかどうか */
export const isTrapCard = (card: CardData): boolean => {
  return card.type === "trap";
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
