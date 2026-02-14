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
import type { CounterState } from "$lib/domain/models/Card";

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
 * フィールドにいる間だけ必要な状態
 *
 * カードがフィールドから離れた場合にクリアされる一時的なプロパティ群。
 * - フィールド: mainMonsterZone, spellTrapZone, fieldZone
 */
export interface StateOnField {
  readonly position?: Position;
  readonly battlePosition?: BattlePosition;
  readonly placedThisTurn: boolean;
  readonly counters: readonly CounterState[];
  /** このインスタンスで発動済みの起動効果ID (effectId) */
  readonly activatedEffects: ReadonlySet<string>;
}

/**
 * 1枚のカードインスタンス
 *
 * カードデータを継承し、全プロパティに加えて1枚ごとのカードを区別するためのユニークIDを持つ。
 * 同じカードを複数枚デッキに入れた場合、 id は同一で、instanceId は異なる。
 */
export interface CardInstance extends CardData {
  readonly instanceId: string;
  readonly location: ZoneName;
  /** フィールド一時状態（フィールド外では undefined） */
  readonly stateOnField?: StateOnField;
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
  return card.stateOnField?.position === "faceUp";
};

/** カードが裏側表示かどうか */
export const isFaceDown = (card: CardInstance): boolean => {
  return card.stateOnField?.position === "faceDown";
};

/** StateOnField の初期値を生成 */
export const createInitialStateOnField = (
  options?: Partial<Pick<StateOnField, "position" | "battlePosition" | "placedThisTurn">>,
): StateOnField => ({
  position: options?.position,
  battlePosition: options?.battlePosition,
  placedThisTurn: options?.placedThisTurn ?? false,
  counters: [],
  activatedEffects: new Set(),
});

/** フィールドに置く際に stateOnField を初期化 */
export const withStateOnField = (
  card: CardInstance,
  options?: Partial<Pick<StateOnField, "position" | "battlePosition" | "placedThisTurn">>,
): CardInstance => ({
  ...card,
  stateOnField: createInitialStateOnField(options),
});

/** フィールドから離れる際に stateOnField をクリア */
export const withoutStateOnField = (card: CardInstance): CardInstance => ({
  ...card,
  stateOnField: undefined,
});
