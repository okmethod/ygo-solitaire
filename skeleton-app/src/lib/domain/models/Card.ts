/**
 * Card - Type definitions for card data and instances
 *
 * Distinguishes between:
 * - CardData: Static, immutable card information (from API/database)
 * - CardInstance: Runtime representation with unique instanceId
 *
 * @module domain/models/Card
 */

/**
 * Card type categories
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
