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
  // 将来拡張用:
  // readonly attack?: number;
  // readonly defense?: number;
  // readonly level?: number;
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
