/**
 * Card - Type definitions for card data and instances
 *
 * Defines:
 * - DomainCardData: Minimal card data for game logic 
 * - CardInstance: Runtime representation with unique instanceId
 *
 * @module domain/models/Card
 */

/**
 * Simplified card type for Domain Layer 
 *
 * YGOPRODeck API互換の簡略化型。
 * ゲームロジックに必要な最小限の3カテゴリのみを表現。
 */
export type SimpleCardType = "monster" | "spell" | "trap";

/**
 * Domain Layer用の最小限カードデータ
 *
 * ゲームロジック実装に必要な最小限のプロパティのみを保持。
 * 表示用データ（name, description, imagesなど）は含まない。
 *
 * 用途: GameState, Rule実装などのDomain Layer内部処理
 * 利点: YGOPRODeck APIに依存せず、ユニットテストがネットワーク不要
 */
export interface DomainCardData {
  readonly id: number; // カードを一意に識別するID（YGOPRODeck API ID）
  readonly type: SimpleCardType; // カードタイプ（"monster" | "spell" | "trap"）
  readonly frameType?: string; // カードフレームタイプ（"normal", "effect"など）
}

/**
 * Card instance in game (runtime)
 * Each physical card in the deck has a unique instanceId
 * Multiple copies of the same card have different instanceIds but same cardId
 */
export interface CardInstance {
  readonly instanceId: string; // Unique instance ID (e.g., "deck-0", "hand-1")
  readonly cardId: string; // References card ID (number as string)
  readonly location: ZoneLocation; // Current location
  readonly position?: "faceUp" | "faceDown"; // For field cards
}

/**
 * Zone location type
 */
export type ZoneLocation = "deck" | "hand" | "field" | "graveyard" | "banished";

/**
 * DomainCardData型ガード: monster type
 *
 * @param card - DomainCardData オブジェクト
 * @returns カードタイプがmonsterの場合true
 */
export function isDomainMonsterCard(card: DomainCardData): boolean {
  return card.type === "monster";
}

/**
 * DomainCardData型ガード: spell type
 *
 * @param card - DomainCardData オブジェクト
 * @returns カードタイプがspellの場合true
 */
export function isDomainSpellCard(card: DomainCardData): boolean {
  return card.type === "spell";
}

/**
 * DomainCardData型ガード: trap type
 *
 * @param card - DomainCardData オブジェクト
 * @returns カードタイプがtrapの場合true
 */
export function isDomainTrapCard(card: DomainCardData): boolean {
  return card.type === "trap";
}

/**
 * DomainCardData検証関数
 *
 * オブジェクトがDomainCardDataの必須プロパティを持つかを検証。
 *
 * @param obj - 検証対象のオブジェクト
 * @returns DomainCardDataの型を満たす場合はtrue
 */
export function isDomainCardData(obj: unknown): obj is DomainCardData {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const data = obj as Record<string, unknown>;

  // 必須プロパティの検証
  if (typeof data.id !== "number") return false;
  if (typeof data.type !== "string") return false;

  // typeが有効な値かを検証
  const validTypes: SimpleCardType[] = ["monster", "spell", "trap"];
  if (!validTypes.includes(data.type as SimpleCardType)) return false;

  // frameTypeはオプショナルだが、存在する場合はstringであること
  if (data.frameType !== undefined && typeof data.frameType !== "string") {
    return false;
  }

  return true;
}
