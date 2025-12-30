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
  // モンスター
  33396948: { id: 33396948, type: "monster", frameType: "effect" }, // 封印されしエクゾディア
  7902349: { id: 7902349, type: "monster", frameType: "normal" }, // 封印されし者の右腕
  70903634: { id: 70903634, type: "monster", frameType: "normal" }, // 封印されし者の左腕
  44519536: { id: 44519536, type: "monster", frameType: "normal" }, // 封印されし者の左足
  8124921: { id: 8124921, type: "monster", frameType: "normal" }, // 封印されし者の右足

  // 通常魔法
  55144522: { id: 55144522, type: "spell", frameType: "spell", spellType: "normal" }, // 強欲な壺
  79571449: { id: 79571449, type: "spell", frameType: "spell", spellType: "normal" }, // 天使の施し
  70368879: { id: 70368879, type: "spell", frameType: "spell", spellType: "normal" }, // 成金ゴブリン
  33782437: { id: 33782437, type: "spell", frameType: "spell", spellType: "normal" }, // 一時休戦
  85852291: { id: 85852291, type: "spell", frameType: "spell", spellType: "normal" }, // 打ち出の小槌
  90928333: { id: 90928333, type: "spell", frameType: "spell", spellType: "normal" }, // 闇の量産工場
  73628505: { id: 73628505, type: "spell", frameType: "spell", spellType: "normal" }, // テラフォーミング

  // 速攻魔法
  74519184: { id: 74519184, type: "spell", frameType: "spell", spellType: "quick-play" }, // 手札断札

  // フィールド魔法
  67616300: { id: 67616300, type: "spell", frameType: "spell", spellType: "field" }, // チキンレース

  // トラップカード
  83968380: { id: 83968380, type: "trap", frameType: "trap", trapType: "normal" }, // 強欲な瓶（未実装）

  // テスト用
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
