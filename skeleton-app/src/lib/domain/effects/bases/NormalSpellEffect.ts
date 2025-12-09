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
import type { EffectResolutionStep } from "../EffectResolutionStep";
import { sendToGraveyard } from "$lib/domain/models/Zone";

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

  /**
   * Create effect resolution steps with automatic graveyard-sending
   *
   * Template Method Pattern:
   * 1. Call createCardSteps() to get card-specific effect steps
   * 2. Append graveyard-sending step (Normal Spell game rule)
   *
   * Game Rule: Normal Spells are sent to graveyard after effect resolution
   *
   * @param state - Current game state (immutable)
   * @param activatedCardInstanceId - Instance ID of the activated card
   * @returns Array of EffectResolutionStep (card effects + graveyard step)
   *
   * @final - Subclasses should NOT override this method
   *
   * @example
   * ```typescript
   * // PotOfGreedEffect returns: [draw step, graveyard step]
   * // GracefulCharityEffect returns: [draw step, discard step, graveyard step]
   * ```
   */
  override createSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    // Get card-specific effect steps from subclass
    const cardSpecificSteps = this.createCardSteps(state);

    // Append graveyard-sending step (Normal Spell rule)
    const graveyardStep: EffectResolutionStep = {
      id: `${this.constructor.name}-to-graveyard`,
      title: "墓地に送ります",
      message: "効果解決後、カードを墓地に送ります",
      action: (currentState: GameState) => {
        const zones = sendToGraveyard(currentState.zones, activatedCardInstanceId);
        return {
          success: true,
          newState: { ...currentState, zones },
          message: "Spell card sent to graveyard",
        };
      },
    };

    return [...cardSpecificSteps, graveyardStep];
  }

  /**
   * Create card-specific effect steps
   *
   * Hook method for Template Method Pattern.
   * Subclasses override this to define card-specific effect logic.
   *
   * Subclass Responsibilities:
   * - PotOfGreedEffect: Return [draw 2 cards step]
   * - GracefulCharityEffect: Return [draw 3 cards step, discard 2 cards step]
   *
   * @param state - Current game state (immutable)
   * @returns Array of card-specific EffectResolutionStep (without graveyard step)
   *
   * @abstract - Subclasses MUST override this method
   *
   * @example
   * ```typescript
   * // PotOfGreedEffect
   * protected createCardSteps(state: GameState): EffectResolutionStep[] {
   *   return [
   *     {
   *       id: "pot-of-greed-draw",
   *       title: "カードをドローします",
   *       message: "デッキから2枚ドローします",
   *       action: (currentState) => { ... }
   *     }
   *   ];
   * }
   * ```
   */
  protected abstract createCardSteps(state: GameState): EffectResolutionStep[];
}
