/**
 * Card Effect System - Entry Point
 *
 * Exports all card effect related classes and initializes the CardEffectRegistry.
 *
 * Architecture:
 * - Strategy Pattern: CardEffect interface + concrete implementations
 * - Registry Pattern: CardEffectRegistry for card ID → effect lookup
 * - Template Method Pattern: SpellEffect → NormalSpellEffect → PotOfGreedEffect
 *
 * Usage:
 * ```typescript
 * import { CardEffectRegistry } from "$lib/application/effects";
 *
 * // In ActivateSpellCommand
 * const cardId = parseInt(cardInstance.cardId, 10);
 * const effect = CardEffectRegistry.get(cardId);
 *
 * if (effect && effect.canActivate(state)) {
 *   const steps = effect.createSteps(state);
 *   effectResolutionStore.startResolution(steps);
 * }
 * ```
 *
 * @module application/effects
 */

// ===========================
// Imports
// ===========================

import { CardEffectRegistry } from "./CardEffectRegistry";
import { PotOfGreedEffect } from "$lib/domain/effects/cards/PotOfGreedEffect";
import { GracefulCharityEffect } from "$lib/domain/effects/cards/GracefulCharityEffect";

// ===========================
// Exports
// ===========================

// Core interfaces and base classes (from Domain Layer)
export type { CardEffect } from "$lib/domain/effects/CardEffect";
export { SpellEffect } from "$lib/domain/effects/bases/SpellEffect";
export { NormalSpellEffect } from "$lib/domain/effects/bases/NormalSpellEffect";

// Concrete card implementations (from Domain Layer)
export { PotOfGreedEffect } from "$lib/domain/effects/cards/PotOfGreedEffect";
export { GracefulCharityEffect } from "$lib/domain/effects/cards/GracefulCharityEffect";

// Registry (Application Layer)
export { CardEffectRegistry } from "./CardEffectRegistry";

// ===========================
// Registry Initialization
// ===========================

/**
 * Initialize CardEffectRegistry with all implemented card effects
 *
 * This function is called automatically when this module is imported.
 * It registers all card effects in the CardEffectRegistry.
 *
 * Registered Cards:
 * - 55144522: Pot of Greed (強欲な壺)
 * - 79571449: Graceful Charity (天使の施し)
 *
 * Future Expansion:
 * When adding new cards, import the effect class above and register it here:
 * ```typescript
 * import { AnotherCardEffect } from "./cards/AnotherCardEffect";
 * CardEffectRegistry.register(12345678, new AnotherCardEffect());
 * ```
 */
function initializeCardEffectRegistry(): void {
  // Register all card effects
  // Card ID 55144522: Pot of Greed (強欲な壺)
  CardEffectRegistry.register(55144522, new PotOfGreedEffect());

  // Card ID 79571449: Graceful Charity (天使の施し)
  CardEffectRegistry.register(79571449, new GracefulCharityEffect());

  // Future cards:
  // CardEffectRegistry.register(12345678, new AnotherCardEffect());
}

// Auto-initialize registry on module import
initializeCardEffectRegistry();
