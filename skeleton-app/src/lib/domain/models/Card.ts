/**
 * Card - カードモデル
 *
 * 「カード1種類」と「カード1枚」を表現するモデル。
 * プレーンなオブジェクトとして実装し、クラス化しない。
 * （理由: Zones 経由で GameState に内包されるため）
 *
 * @module domain/models/Card
 * @see {@link docs/domain/card-model.md}
 */

import type { ZoneName } from "$lib/domain/models/Zone";
import type { CounterState } from "$lib/domain/models/Counter";

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
  readonly counters: readonly CounterState[]; // カウンター情報
}

/** カードインスタンスの状態を更新する */
export const updatedCardInstance = (card: CardInstance, updates: Partial<CardInstance>): CardInstance => {
  return { ...card, ...updates };
};

/** CardData型ガード: モンスターカード */
export const isMonsterCard = (card: CardData): boolean => {
  return card.type === "monster";
};

/** CardData型ガード: 魔法カード */
export const isSpellCard = (card: CardData): boolean => {
  return card.type === "spell";
};

/** CardData型ガード: 通常魔法カード */
export const isNormalSpellCard = (card: CardData): boolean => {
  return card.type === "spell" && card.spellType === "normal";
};

/** CardData型ガード: 速攻魔法カード */
export const isQuickPlaySpellCard = (card: CardData): boolean => {
  return card.type === "spell" && card.spellType === "quick-play";
};

/** CardData型ガード: フィールド魔法カード */
export const isFieldSpellCard = (card: CardData): boolean => {
  return card.type === "spell" && card.spellType === "field";
};

/** CardData型ガード: 罠カード */
export const isTrapCard = (card: CardData): boolean => {
  return card.type === "trap";
};

/** カードが表側表示かどうか */
export const isFaceUp = (card: CardInstance): boolean => {
  return card.position === "faceUp";
};

/** カードが裏側表示かどうか */
export const isFaceDown = (card: CardInstance): boolean => {
  return card.position === "faceDown";
};
