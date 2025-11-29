/**
 * Card - Type definitions for card data and instances
 *
 * Distinguishes between:
 * - DomainCardData: Minimal card data for game logic (NEW - T014, T015)
 * - CardData: Static, immutable card information (DEPRECATED - use DomainCardData)
 * - CardInstance: Runtime representation with unique instanceId
 *
 * @module domain/models/Card
 */

/**
 * Simplified card type for Domain Layer (T014)
 *
 * YGOPRODeck API互換の簡略化型。
 * ゲームロジックに必要な最小限の3カテゴリのみを表現。
 */
export type SimpleCardType = "monster" | "spell" | "trap";

/**
 * Card type categories (LEGACY)
 *
 * @deprecated Use SimpleCardType for new code (T016)
 */
export type CardType =
  | "Effect Monster"
  | "Normal Monster"
  | "Ritual Monster"
  | "Fusion Monster"
  | "Synchro Monster"
  | "XYZ Monster"
  | "Link Monster"
  | "Spell Card"
  | "Trap Card";

/**
 * Domain Layer用の最小限カードデータ（T014）
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
 * Monster card attributes
 */
export type Attribute = "DARK" | "LIGHT" | "EARTH" | "WATER" | "FIRE" | "WIND" | "DIVINE";

/**
 * Monster card race/species
 */
export type Race =
  | "Spellcaster"
  | "Dragon"
  | "Zombie"
  | "Warrior"
  | "Beast-Warrior"
  | "Beast"
  | "Winged Beast"
  | "Fiend"
  | "Fairy"
  | "Insect"
  | "Dinosaur"
  | "Reptile"
  | "Fish"
  | "Sea Serpent"
  | "Machine"
  | "Thunder"
  | "Aqua"
  | "Pyro"
  | "Rock"
  | "Plant"
  | "Psychic"
  | "Divine-Beast"
  | "Creator God"
  | "Wyrm"
  | "Cyberse";

/**
 * Spell card race/category
 */
export type SpellRace = "Normal" | "Field" | "Equip" | "Continuous" | "Quick-Play" | "Ritual";

/**
 * Trap card race/category
 */
export type TrapRace = "Normal" | "Continuous" | "Counter";

/**
 * Static card data (immutable, from API/database)
 * This represents the card's official information
 *
 * @deprecated Use DomainCardData for new code (T016)
 */
export interface CardData {
  readonly id: string; // Card ID (e.g., "33396948" for Exodia)
  readonly name: string;
  readonly type: CardType;
  readonly desc: string;
  readonly race: Race | SpellRace | TrapRace;
  readonly atk?: number; // For monster cards
  readonly def?: number; // For monster cards
  readonly level?: number; // For monster cards
  readonly attribute?: Attribute; // For monster cards
  readonly archetype?: string;
  readonly imageUrl?: string;
}

/**
 * Card instance in game (runtime)
 * Each physical card in the deck has a unique instanceId
 * Multiple copies of the same card have different instanceIds but same cardId
 */
export interface CardInstance {
  readonly instanceId: string; // Unique instance ID (e.g., "deck-0", "hand-1")
  readonly cardId: string; // References CardData.id
  readonly location: ZoneLocation; // Current location
  readonly position?: "faceUp" | "faceDown"; // For field cards
}

/**
 * Zone location type
 */
export type ZoneLocation = "deck" | "hand" | "field" | "graveyard" | "banished";

/**
 * Helper to check if a card is a monster
 */
export function isMonsterCard(cardData: CardData): boolean {
  return cardData.type.includes("Monster") && cardData.atk !== undefined && cardData.def !== undefined;
}

/**
 * Helper to check if a card is a spell
 */
export function isSpellCard(cardData: CardData): boolean {
  return cardData.type === "Spell Card";
}

/**
 * Helper to check if a card is a trap
 */
export function isTrapCard(cardData: CardData): boolean {
  return cardData.type === "Trap Card";
}

/**
 * Helper to check if a spell is a Normal spell
 */
export function isNormalSpell(cardData: CardData): boolean {
  return isSpellCard(cardData) && cardData.race === "Normal";
}

/**
 * Helper to check if a card is an Exodia piece
 */
export function isExodiaPiece(cardId: string): boolean {
  const exodiaPieceIds = [
    "33396948", // Exodia the Forbidden One (head)
    "07902349", // Right Arm of the Forbidden One
    "70903634", // Left Arm of the Forbidden One
    "08124921", // Right Leg of the Forbidden One
    "44519536", // Left Leg of the Forbidden One
  ];
  return exodiaPieceIds.includes(cardId);
}

/**
 * DomainCardData型ガード: monster type（T020）
 *
 * @param card - DomainCardData オブジェクト
 * @returns カードタイプがmonsterの場合true
 */
export function isDomainMonsterCard(card: DomainCardData): boolean {
  return card.type === "monster";
}

/**
 * DomainCardData型ガード: spell type（T021）
 *
 * @param card - DomainCardData オブジェクト
 * @returns カードタイプがspellの場合true
 */
export function isDomainSpellCard(card: DomainCardData): boolean {
  return card.type === "spell";
}

/**
 * DomainCardData型ガード: trap type（T022）
 *
 * @param card - DomainCardData オブジェクト
 * @returns カードタイプがtrapの場合true
 */
export function isDomainTrapCard(card: DomainCardData): boolean {
  return card.type === "trap";
}

/**
 * DomainCardData検証関数（T019）
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
