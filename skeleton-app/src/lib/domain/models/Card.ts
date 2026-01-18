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

/**
 * 1枚のカードインスタンス
 *
 * カードデータを継承し、全プロパティに加えて1枚ごとのカードを区別するためのユニークIDを持つ。
 * 同じカードを複数枚デッキに入れた場合、 id は同一で、instanceId は異なる。
 */
export interface CardInstance extends CardData {
  readonly instanceId: string; // Unique instance ID
  readonly location: ZoneName;
  readonly position?: "faceUp" | "faceDown"; // For field cards
  readonly battlePosition?: "attack" | "defense"; // For monster cards (召喚時attack、セット時defense)
  readonly placedThisTurn: boolean; // このターンに配置されたか（初期値false）
}

/**
 * CardData型ガード: monster type
 *
 * @param card - CardData オブジェクト
 * @returns カードタイプがmonsterの場合true
 */
export function isMonsterCard(card: CardData): boolean {
  return card.type === "monster";
}

/**
 * CardData型ガード: spell type
 *
 * @param card - CardData オブジェクト
 * @returns カードタイプがspellの場合true
 */
export function isSpellCard(card: CardData): boolean {
  return card.type === "spell";
}

/**
 * CardData型ガード: trap type
 *
 * @param card - CardData オブジェクト
 * @returns カードタイプがtrapの場合true
 */
export function isTrapCard(card: CardData): boolean {
  return card.type === "trap";
}

/**
 * CardData検証関数
 *
 * オブジェクトがCardDataの必須プロパティを持つかを検証。
 *
 * @param obj - 検証対象のオブジェクト
 * @returns CardDataの型を満たす場合はtrue
 */
export function isCardData(obj: unknown): obj is CardData {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const data = obj as Record<string, unknown>;

  // 必須プロパティの検証
  if (typeof data.id !== "number") return false;
  if (typeof data.type !== "string") return false;

  // typeが有効な値かを検証
  const validTypes: CardType[] = ["monster", "spell", "trap"];
  if (!validTypes.includes(data.type as CardType)) return false;

  // frameTypeはオプショナルだが、存在する場合はstringであること
  if (data.frameType !== undefined && typeof data.frameType !== "string") {
    return false;
  }

  return true;
}
