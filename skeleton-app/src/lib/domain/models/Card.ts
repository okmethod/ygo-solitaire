/**
 * Card - カードモデル
 *
 * @module domain/models/Card
 * @see {@link docs/domain/card-model.md}
 */

import type { ZoneName } from "$lib/domain/models/Zone";

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
  readonly id: number; // カードを一意に識別するID（YGOPRODeck API ID）
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

/** カードの表側表示・裏側表示 */
export type Position = "faceUp" | "faceDown";

/** モンスターカードの攻撃表示・守備表示 */
export type BattlePosition = "attack" | "defense";

/**
 * 1枚のカードインスタンス
 *
 * カードデータを継承し、全プロパティに加えて1枚ごとのカードを区別するためのユニークIDを持つ。
 * 同じカードを複数枚デッキに入れた場合、 id は同一で、instanceId は異なる。
 */
export interface CardInstance extends CardData {
  readonly instanceId: string; // Unique instance ID
  readonly location: ZoneName;
  readonly position?: Position;
  readonly battlePosition?: BattlePosition;
  readonly placedThisTurn: boolean; // Default: false
}

/** CardData型ガード: モンスターカード */
export function isMonsterCard(card: CardData): boolean {
  return card.type === "monster";
}

/** CardData型ガード: 魔法カード */
export function isSpellCard(card: CardData): boolean {
  return card.type === "spell";
}

/** CardData型ガード: 通常魔法カード */
export function isNormalSpellCard(card: CardData): boolean {
  return card.type === "spell" && card.spellType === "normal";
}

/** CardData型ガード: 速攻魔法カード */
export function isQuickPlaySpellCard(card: CardData): boolean {
  return card.type === "spell" && card.spellType === "quick-play";
}

/** CardData型ガード: フィールド魔法カード */
export function isFieldSpellCard(card: CardData): boolean {
  return card.type === "spell" && card.spellType === "field";
}

/** CardData型ガード: 罠カード */
export function isTrapCard(card: CardData): boolean {
  return card.type === "trap";
}
