/**
 * NormalSpellEffect - Abstract base class for Normal Spell cards
 *
 * Implements validation logic specific to Normal Spell cards.
 * Normal Spells can only be activated during the player's Main Phase 1 or Main Phase 2.
 *
 * Design Pattern:
 * - Pattern: Template Method Pattern
 * - Purpose: Define Normal Spell validation skeleton
 * - Extensibility: Subclasses override canActivateNormalSpell() for card-specific validation
 *
 * Validation Order:
 * 1. Game-over check (SpellEffect)
 * 2. Main Phase check (this class)
 * 3. Card-specific validation (subclass: PotOfGreedEffect, GracefulCharityEffect, etc.)
 *
 * @module domain/effects/bases/NormalSpellEffect
 */

import { SpellEffect } from "./SpellEffect";
import type { GameState } from "$lib/domain/models/GameState";

/**
 * NormalSpellEffect - Abstract base class for Normal Spell cards
 *
 * Template Method Pattern:
 * - canActivateSpell(): Template method (final logic)
 * - canActivateNormalSpell(): Hook method (subclass override)
 *
 * Inheritance Hierarchy:
 * ```
 * CardEffect (interface)
 *   ↓
 * SpellEffect (abstract class)
 *   ↓
 * NormalSpellEffect (this class)
 *   ↓
 * PotOfGreedEffect / GracefulCharityEffect / ...
 * ```
 *
 * Normal Spell Rules (Yu-Gi-Oh! OCG):
 * - Can be activated during Main Phase 1 or Main Phase 2
 * - Cannot be activated during Battle Phase, End Phase, etc.
 * - Single-use effect (sent to graveyard after activation)
 *
 * @example
 * ```typescript
 * // Subclass example: PotOfGreedEffect
 * export class PotOfGreedEffect extends NormalSpellEffect {
 *   protected canActivateNormalSpell(state: GameState): boolean {
 *     // Card-specific validation: Deck must have at least 2 cards
 *     return state.zones.deck.length >= 2;
 *   }
 *
 *   createSteps(state: GameState): EffectResolutionStep[] {
 *     return [
 *       {
 *         id: "pot-of-greed-draw",
 *         title: "カードをドローします",
 *         message: "デッキから2枚ドローします",
 *         action: () => { ... }
 *       }
 *     ];
 *   }
 * }
 * ```
 */
export abstract class NormalSpellEffect extends SpellEffect {
  /**
   * Check if the Normal Spell can be activated
   *
   * Template Method Pattern:
   * 1. Check phase === "Main1" (Normal Spell specific)
   * 2. Delegate to canActivateNormalSpell() for card-specific validation
   *
   * @param state - Current game state (immutable)
   * @returns true if Normal Spell can be activated, false otherwise
   *
   * @final - Subclasses should NOT override this method
   *
   * @example
   * ```typescript
   * // Current implementation scope: Only Main1 phase
   * // Future expansion: Support Main2 phase
   *
   * // Current state:
   * if (state.phase !== "Main1") return false;
   *
   * // Future state (when Main2 phase is implemented):
   * if (state.phase !== "Main1" && state.phase !== "Main2") return false;
   * ```
   */
  protected canActivateSpell(state: GameState): boolean {
    // Normal Spell specific validation: Can only activate during Main Phase
    // Note: Currently only Main1 is implemented (Main2 is future work)
    if (state.phase !== "Main1") {
      return false;
    }

    // Delegate to subclass for card-specific validation
    return this.canActivateNormalSpell(state);
  }

  /**
   * Check if the Normal Spell can be activated (card-specific)
   *
   * Hook method for Template Method Pattern.
   * Subclasses override this to implement card-specific validation.
   *
   * Subclass Responsibilities:
   * - PotOfGreedEffect: Check deck.length >= 2
   * - GracefulCharityEffect: Check deck.length >= 3
   * - MonsterRebornEffect: Check graveyard has monsters
   *
   * @param state - Current game state (immutable)
   * @returns true if card-specific conditions are met, false otherwise
   *
   * @abstract - Subclasses MUST override this method
   *
   * @example
   * ```typescript
   * // PotOfGreedEffect
   * protected canActivateNormalSpell(state: GameState): boolean {
   *   return state.zones.deck.length >= 2;
   * }
   *
   * // GracefulCharityEffect
   * protected canActivateNormalSpell(state: GameState): boolean {
   *   return state.zones.deck.length >= 3;
   * }
   * ```
   */
  protected abstract canActivateNormalSpell(state: GameState): boolean;
}
