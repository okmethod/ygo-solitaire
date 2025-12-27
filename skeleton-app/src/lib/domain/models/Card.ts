/**
 * Card - Type definitions for card data and instances
 *
 * Defines:
 * - CardData: Minimal card data for game logic
 * - CardInstance: Runtime representation with unique instanceId
 *
 * @module domain/models/Card
 */

/**
 * Card type for Domain Layer
 */
export type CardType = "monster" | "spell" | "trap";

/**
 * Sub type for Domain Layer
 */
export type MainMonsterSubType = "normal" | "effect" | "ritual" | "pendulum";
export type ExtraMonsterSubType = "fusion" | "synchro" | "xyz" | "link";
export type FrameSubType = MainMonsterSubType | ExtraMonsterSubType | "spell" | "trap";
export type SpellSubType = "normal" | "quick-play" | "continuous" | "field" | "equip" | "ritual";
export type TrapSubType = "normal" | "continuous" | "counter";

/**
 * Domain Layer用の最小限カードデータ
 *
 * ゲームロジック実装に必要な最小限のプロパティのみを保持。
 * 表示用データ（name, description, imagesなど）は含まない。
 *
 * 用途: GameState, Rule実装などのDomain Layer内部処理
 * 利点: YGOPRODeck APIに依存せず、ユニットテストがネットワーク不要
 */
export interface CardData {
  readonly id: number; // カードを一意に識別するID（YGOPRODeck API ID）
  readonly type: CardType; // カードタイプ
  readonly frameType: FrameSubType; // カードフレームタイプ
  readonly spellType?: SpellSubType; // 魔法カード種別（spellの場合のみ）
  readonly trapType?: TrapSubType; // 罠カード種別（trapの場合のみ）
  // 将来拡張用:
  // readonly attack?: number;
  // readonly defense?: number;
  // readonly level?: number;
}

/**
 * Card instance in game (runtime)
 *
 * Extends CardData to include all card properties plus runtime instance information.
 * Each physical card in the deck has a unique instanceId.
 * Multiple copies of the same card have different instanceIds but same id (CardData.id).
 *
 * Design Decision: CardInstance extends CardData to avoid data duplication
 * and ensure CardInstance always has access to all card properties without
 * requiring lookups to CardDataRegistry.
 */
export interface CardInstance extends CardData {
  readonly instanceId: string; // Unique instance ID (e.g., "deck-0", "hand-1")
  readonly location: ZoneLocation; // Current location
  readonly position?: "faceUp" | "faceDown"; // For field cards
}

/**
 * Zone location type
 */
export type ZoneLocation = "deck" | "hand" | "field" | "graveyard" | "banished";

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
