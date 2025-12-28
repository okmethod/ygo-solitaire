/**
 * CardDataRegistry - Domain Layer Card Data Registry (Registry Pattern)
 *
 * Provides card data for game logic without depending on external APIs.
 * This ensures Domain Layer independence from Infrastructure Layer (YGOPRODeck API).
 *
 * Registry Pattern:
 * - Centralizes card data management
 * - Provides O(1) lookup by card ID
 * - Separates from Infrastructure Layer's "database" concept
 *
 * @module domain/registries/CardDataRegistry
 */

import type { CardData, CardType } from "../models/Card";

/**
 * Card data registry (Registry Pattern)
 *
 * Maps card ID to domain card data.
 * Only includes cards used in the game (not a complete database).
 */
const CARD_DATA_REGISTRY: Record<number, CardData> = {
  // Exodia pieces (monster)
  33396948: { id: 33396948, type: "monster", frameType: "effect" }, // Exodia the Forbidden One
  7902349: { id: 7902349, type: "monster", frameType: "normal" }, // Right Arm of the Forbidden One
  70903634: { id: 70903634, type: "monster", frameType: "normal" }, // Left Arm of the Forbidden One
  44519536: { id: 44519536, type: "monster", frameType: "normal" }, // Left Leg of the Forbidden One
  8124921: { id: 8124921, type: "monster", frameType: "normal" }, // Right Leg of the Forbidden One

  // Spell cards
  55144522: { id: 55144522, type: "spell", frameType: "spell", spellType: "normal" }, // Pot of Greed
  79571449: { id: 79571449, type: "spell", frameType: "spell", spellType: "normal" }, // Graceful Charity
  67616300: { id: 67616300, type: "spell", frameType: "spell", spellType: "field" }, // Chicken Game

  // Trap cards
  83968380: { id: 83968380, type: "trap", frameType: "trap", trapType: "normal" }, // Jar of Greed

  // Test card IDs (for unit tests)
  1001: { id: 1001, type: "spell", frameType: "spell", spellType: "normal" },
  1002: { id: 1002, type: "spell", frameType: "spell", spellType: "normal" },
  1003: { id: 1003, type: "spell", frameType: "spell", spellType: "normal" },
  1004: { id: 1004, type: "spell", frameType: "spell", spellType: "normal" },
  1005: { id: 1005, type: "spell", frameType: "spell", spellType: "normal" },
  11111111: { id: 11111111, type: "monster", frameType: "normal" },
  12345678: { id: 12345678, type: "monster", frameType: "normal" },
  22222222: { id: 22222222, type: "monster", frameType: "normal" },
  33333333: { id: 33333333, type: "monster", frameType: "normal" },
  87654321: { id: 87654321, type: "monster", frameType: "normal" },
};

/**
 * Get card data from registry
 *
 * @param cardId - Card ID (YGOPRODeck compatible)
 * @returns Domain card data
 * @throws Error if card not found in registry
 */
export function getCardData(cardId: number): CardData {
  const card = CARD_DATA_REGISTRY[cardId];
  if (!card) {
    throw new Error(
      `Card data not found in registry: ${cardId}. ` +
        `Please add this card to CARD_DATA_REGISTRY in CardDataRegistry.ts`,
    );
  }
  return card;
}

/**
 * Get card type from registry
 *
 * @param cardId - Card ID
 * @returns Card type ("monster" | "spell" | "trap")
 */
export function getCardType(cardId: number): CardType {
  return getCardData(cardId).type;
}

/**
 * Check if card exists in registry
 *
 * @param cardId - Card ID
 * @returns True if card exists
 */
export function hasCardData(cardId: number): boolean {
  return CARD_DATA_REGISTRY[cardId] !== undefined;
}
