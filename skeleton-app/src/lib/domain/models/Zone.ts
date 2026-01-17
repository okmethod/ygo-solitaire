/**
 * Zone - Game zone type definitions
 *
 * Defines the structure of game zones (deck, hand, field, graveyard, banished)
 * and operations for moving cards between zones.
 *
 * @module domain/models/Zone
 */

import type { CardInstance } from "./Card";
import { shuffleArray } from "$lib/shared/utils/arrayUtils";

/**
 * Collection of all game zones
 * Each zone is an array of CardInstance
 */
export interface Zones {
  readonly deck: readonly CardInstance[];
  // TODO: メインデッキとエクストラデッキを分離する
  // readonly mainDeck: readonly CardInstance[];
  // readonly extraDeck: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly mainMonsterZone: readonly CardInstance[];
  readonly spellTrapZone: readonly CardInstance[];
  readonly fieldZone: readonly CardInstance[];
  readonly graveyard: readonly CardInstance[];
  readonly banished: readonly CardInstance[];
}

// TODO: ゾーン名の型エイリアスを定義する
// export type ZoneName = keyof Zones

/**
 * Helper to move a card from one zone to another
 *
 * @param zones - Current zones state
 * @param instanceId - Card instance ID to move
 * @param from - Source zone name
 * @param to - Destination zone name
 * @param position - Optional position for field zone
 * @param battlePosition - Optional battle position for monster cards
 * @param placedThisTurn - Optional flag to indicate if the card was placed this turn
 * @param battlePosition - Optional battle position for monster cards
 * @returns Updated zones object
 * 
 * TODO: updates?: Partial<CardInstance> のようにした方が良いかも
 *
 * @example
 * const newZones = moveCard(zones, "deck-0", "deck", "hand");
 */
export function moveCard(
  zones: Zones,
  instanceId: string,
  from: keyof Zones,
  to: keyof Zones,
  position?: "faceUp" | "faceDown",
  battlePosition?: "attack" | "defense",
  placedThisTurn?: boolean,
): Zones {
  const sourceZone = zones[from];
  const cardIndex = sourceZone.findIndex((card) => card.instanceId === instanceId);

  if (cardIndex === -1) {
    throw new Error(`Card with instanceId ${instanceId} not found in ${from} zone`);
  }

  const card = sourceZone[cardIndex];
  const updatedCard: CardInstance = {
    ...card,
    location: to,
    ...(position && { position }),
    ...(battlePosition && { battlePosition }),
    ...(placedThisTurn !== undefined && { placedThisTurn }),
  };

  return {
    ...zones,
    [from]: [...sourceZone.slice(0, cardIndex), ...sourceZone.slice(cardIndex + 1)],
    [to]: [...zones[to], updatedCard],
  };
}

/**
 * Helper to draw top N cards from deck to hand
 *
 * @param zones - Current zones state
 * @param count - Number of cards to draw (default: 1)
 * @returns Updated zones object
 * @throws Error if deck has insufficient cards
 */
export function drawCards(zones: Zones, count: number = 1): Zones {
  if (zones.deck.length < count) {
    throw new Error(`Cannot draw ${count} cards. Only ${zones.deck.length} cards remaining in deck.`);
  }

  let updatedZones = zones;

  for (let i = 0; i < count; i++) {
    const topCard = updatedZones.deck[updatedZones.deck.length - 1];
    updatedZones = moveCard(updatedZones, topCard.instanceId, "deck", "hand");
  }

  return updatedZones;
}

/**
 * Helper to send a card to graveyard
 *
 * @param zones - Current zones state
 * @param instanceId - Card instance ID to send to graveyard
 * @returns Updated zones object
 */
export function sendToGraveyard(zones: Zones, instanceId: string): Zones {
  const card = [...zones.mainMonsterZone, ...zones.spellTrapZone, ...zones.fieldZone, ...zones.hand].find(
    (c) => c.instanceId === instanceId,
  );

  if (!card) {
    throw new Error(
      `Card with instanceId ${instanceId} not found in mainMonsterZone, spellTrapZone, fieldZone, or hand`,
    );
  }

  const sourceZone = card.location as keyof Zones;
  return moveCard(zones, instanceId, sourceZone, "graveyard");
}

/**
 * Helper to discard multiple cards from hand to graveyard
 *
 * @param zones - Current zones state
 * @param instanceIds - Array of card instance IDs to discard
 * @returns Updated zones object
 * @throws Error if any card is not found in hand
 *
 * @example
 * const newZones = discardCards(zones, ["hand-0", "hand-2"]);
 */
export function discardCards(zones: Zones, instanceIds: string[]): Zones {
  // Validate all cards are in hand
  for (const instanceId of instanceIds) {
    const cardInHand = zones.hand.find((c) => c.instanceId === instanceId);
    if (!cardInHand) {
      throw new Error(`Card with instanceId ${instanceId} not found in hand`);
    }
  }

  // Move cards one by one to graveyard
  let updatedZones = zones;
  for (const instanceId of instanceIds) {
    updatedZones = moveCard(updatedZones, instanceId, "hand", "graveyard");
  }

  return updatedZones;
}

/**
 * Helper to banish a card
 *
 * @param zones - Current zones state
 * @param instanceId - Card instance ID to banish
 * @param from - Source zone name
 * @returns Updated zones object
 */
export function banishCard(zones: Zones, instanceId: string, from: keyof Zones): Zones {
  return moveCard(zones, instanceId, from, "banished");
}

/**
 * Helper to count cards in a specific zone
 */
export function countZone(zones: Zones, zone: keyof Zones): number {
  return zones[zone].length;
}

/**
 * Helper to check if deck is empty
 */
export function isDeckEmpty(zones: Zones): boolean {
  return zones.deck.length === 0;
}

/**
 * Helper to check if hand is full (max 6 cards in typical rules)
 * Note: In some formats, there's no hand size limit, but for this implementation
 * we'll enforce a soft limit for UI purposes
 */
export function isHandFull(zones: Zones, maxHandSize: number = 6): boolean {
  return zones.hand.length >= maxHandSize;
}

/**
 * Helper to shuffle the deck
 *
 * @param zones - Current zones state
 * @returns Updated zones object with shuffled deck
 *
 * @example
 * const newZones = shuffleDeck(zones);
 */
export function shuffleDeck(zones: Zones): Zones {
  return {
    ...zones,
    deck: shuffleArray(zones.deck),
  };
}
