/**
 * CardEffectRegistry - Central registry for all card effects
 *
 * Singleton pattern registry that maps card IDs to CardEffect implementations.
 * Provides O(1) lookup for card effects by card ID.
 *
 * Design Pattern:
 * - Pattern: Registry Pattern (Singleton variant)
 * - Purpose: Central storage for all CardEffect instances
 * - Lookup: O(1) time complexity using Map<number, CardEffect>
 *
 * Open/Closed Principle:
 * - New cards: Register new CardEffect instance (no code changes to existing logic)
 * - Existing cards: No modifications needed when adding new cards
 *
 * @module domain/effects/CardEffectRegistry
 */

import type { CardEffect } from "$lib/domain/effects/CardEffect";

/**
 * CardEffectRegistry - Static registry for card effects
 *
 * Usage:
 * 1. Initialize: Register all card effects in index.ts
 * 2. Lookup: ActivateSpellCommand calls CardEffectRegistry.get(cardId)
 * 3. Test cleanup: Call CardEffectRegistry.clear() in test teardown
 *
 * Performance:
 * - Initialization: O(n) where n = number of registered cards
 * - Lookup: O(1) using Map.get()
 * - Memory: O(n) where n = number of registered cards
 *
 * @example
 * ```typescript
 * // Initialization (in index.ts)
 * CardEffectRegistry.register(55144522, new PotOfGreedEffect());
 * CardEffectRegistry.register(79571449, new GracefulCharityEffect());
 *
 * // Usage (in ActivateSpellCommand)
 * const cardId = parseInt(cardInstance.cardId, 10);
 * const effect = CardEffectRegistry.get(cardId);
 * if (effect && effect.canActivate(state)) {
 *   const steps = effect.createSteps(state);
 *   effectResolutionStore.startResolution(steps);
 * }
 *
 * // Test cleanup (in beforeEach)
 * CardEffectRegistry.clear();
 * ```
 */
export class CardEffectRegistry {
  /**
   * Internal storage: Map<cardId, CardEffect>
   *
   * Key: Card ID (YGOPRODeck API compatible number)
   * Value: CardEffect instance (PotOfGreedEffect, GracefulCharityEffect, etc.)
   *
   * @private
   */
  private static effects: Map<number, CardEffect> = new Map();

  /**
   * Register a card effect
   *
   * Associates a card ID with a CardEffect implementation.
   * If the card ID is already registered, it will be overwritten.
   *
   * @param cardId - Card ID (YGOPRODeck API compatible number)
   * @param effect - CardEffect implementation
   *
   * @example
   * ```typescript
   * // Register Pot of Greed
   * CardEffectRegistry.register(55144522, new PotOfGreedEffect());
   *
   * // Register Graceful Charity
   * CardEffectRegistry.register(79571449, new GracefulCharityEffect());
   * ```
   */
  static register(cardId: number, effect: CardEffect): void {
    this.effects.set(cardId, effect);
  }

  /**
   * Get a card effect by card ID
   *
   * Returns the CardEffect instance associated with the given card ID.
   * Returns undefined if the card ID is not registered.
   *
   * Time Complexity: O(1)
   *
   * @param cardId - Card ID (YGOPRODeck API compatible number)
   * @returns CardEffect instance or undefined if not registered
   *
   * @example
   * ```typescript
   * // Get Pot of Greed effect
   * const effect = CardEffectRegistry.get(55144522);
   * if (effect) {
   *   // effect.canActivate(state)
   *   // effect.createSteps(state)
   * }
   *
   * // Get unknown card effect
   * const unknown = CardEffectRegistry.get(99999999);
   * // unknown === undefined
   * ```
   */
  static get(cardId: number): CardEffect | undefined {
    return this.effects.get(cardId);
  }

  /**
   * Clear all registered card effects
   *
   * Removes all card effects from the registry.
   * Primarily used for test cleanup to ensure test isolation.
   *
   * @example
   * ```typescript
   * // Test cleanup
   * beforeEach(() => {
   *   CardEffectRegistry.clear();
   * });
   * ```
   */
  static clear(): void {
    this.effects.clear();
  }

  /**
   * Get the number of registered card effects
   *
   * Returns the total number of registered card effects.
   * Primarily used for testing and debugging.
   *
   * @returns Number of registered card effects
   *
   * @example
   * ```typescript
   * CardEffectRegistry.register(55144522, new PotOfGreedEffect());
   * CardEffectRegistry.register(79571449, new GracefulCharityEffect());
   * CardEffectRegistry.size(); // 2
   * ```
   */
  static size(): number {
    return this.effects.size;
  }
}
