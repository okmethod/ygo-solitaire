/**
 * SpellEffect - Abstract base class for all spell card effects
 *
 * Implements common spell card validation logic.
 * Subclasses implement specific spell type validation (Normal, Quick-Play, Continuous, etc.)
 *
 * Design Pattern:
 * - Pattern: Template Method Pattern
 * - Purpose: Define common spell validation skeleton
 * - Extensibility: Subclasses override canActivateSpell() for specific spell types
 *
 * Validation Order:
 * 1. Game-over check (this class)
 * 2. Spell-type-specific validation (subclass: NormalSpellEffect, QuickPlaySpellEffect, etc.)
 * 3. Card-specific validation (concrete class: PotOfGreedEffect, GracefulCharityEffect, etc.)
 *
 * @module domain/effects/bases/SpellEffect
 */

import type { CardEffect } from "../CardEffect";
import type { GameState } from "../../models/GameState";
import type { EffectResolutionStep } from "../EffectResolutionStep";

/**
 * SpellEffect - Abstract base class for spell cards
 *
 * Template Method Pattern:
 * - canActivate(): Template method (final logic)
 * - canActivateSpell(): Hook method (subclass override)
 *
 * Inheritance Hierarchy:
 * ```
 * CardEffect (interface)
 *   ↓
 * SpellEffect (this class)
 *   ↓
 * NormalSpellEffect / QuickPlaySpellEffect / ContinuousSpellEffect / ...
 *   ↓
 * PotOfGreedEffect / GracefulCharityEffect / ...
 * ```
 *
 * @example
 * ```typescript
 * // Subclass example: NormalSpellEffect
 * export abstract class NormalSpellEffect extends SpellEffect {
 *   protected canActivateSpell(state: GameState): boolean {
 *     if (state.phase !== "Main1") return false;
 *     return this.canActivateNormalSpell(state);
 *   }
 *   protected abstract canActivateNormalSpell(state: GameState): boolean;
 * }
 * ```
 */
export abstract class SpellEffect implements CardEffect {
  /**
   * Check if the spell card effect can be activated
   *
   * Template Method Pattern:
   * 1. Check game-over status (common to all spells)
   * 2. Delegate to canActivateSpell() for spell-type-specific validation
   *
   * @param state - Current game state (immutable)
   * @returns true if effect can be activated, false otherwise
   *
   * @final - Subclasses should NOT override this method
   */
  canActivate(state: GameState): boolean {
    // Common validation: Cannot activate spells when game is over
    if (state.result.isGameOver) {
      return false;
    }

    // Delegate to subclass for spell-type-specific validation
    return this.canActivateSpell(state);
  }

  /**
   * Check if the spell card can be activated (spell-type-specific)
   *
   * Hook method for Template Method Pattern.
   * Subclasses override this to implement spell-type-specific validation.
   *
   * Subclass Responsibilities:
   * - NormalSpellEffect: Check phase === "Main1"
   * - QuickPlaySpellEffect: Check phase allows Quick-Play activation
   * - ContinuousSpellEffect: Check continuous spell activation conditions
   *
   * @param state - Current game state (immutable)
   * @returns true if spell can be activated, false otherwise
   *
   * @abstract - Subclasses MUST override this method
   *
   * @example
   * ```typescript
   * // NormalSpellEffect
   * protected canActivateSpell(state: GameState): boolean {
   *   if (state.phase !== "Main1") return false;
   *   return this.canActivateNormalSpell(state);
   * }
   * ```
   */
  protected abstract canActivateSpell(state: GameState): boolean;

  /**
   * Create effect resolution steps
   *
   * Concrete classes implement this to define card-specific effect logic.
   * Returns an array of EffectResolutionStep to be executed sequentially.
   *
   * @param state - Current game state (immutable)
   * @param activatedCardInstanceId - Instance ID of the activated card (for graveyard-sending)
   * @returns Array of EffectResolutionStep to be executed
   *
   * @abstract - Subclasses MUST override this method
   *
   * @example
   * ```typescript
   * // PotOfGreedEffect
   * createSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
   *   return [
   *     {
   *       id: "pot-of-greed-draw",
   *       title: "カードをドローします",
   *       message: "デッキから2枚ドローします",
   *       action: () => {
   *         const drawCmd = new DrawCardCommand(2);
   *         const result = drawCmd.execute(get(gameStateStore));
   *         if (result.success) gameStateStore.set(result.newState);
   *       }
   *     }
   *   ];
   * }
   * ```
   */
  abstract createSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
}
