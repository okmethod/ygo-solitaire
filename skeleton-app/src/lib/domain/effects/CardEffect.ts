/**
 * CardEffect - Base interface for all card effects
 *
 * Implements Strategy Pattern for card effect processing.
 * Each card's effect is encapsulated in a CardEffect implementation.
 *
 * Design Pattern:
 * - Pattern: Strategy Pattern
 * - Context: ActivateSpellCommand
 * - Strategy: CardEffect (this interface)
 * - Concrete Strategy: PotOfGreedEffect, GracefulCharityEffect, etc.
 *
 * Open/Closed Principle:
 * - Open for extension: New cards = new CardEffect classes
 * - Closed for modification: No changes to existing code
 *
 * @module domain/effects/CardEffect
 */

import type { GameState } from "../models/GameState";
import type { EffectResolutionStep } from "./EffectResolutionStep";

/**
 * CardEffect interface - All card effects must implement this
 *
 * Liskov Substitution Principle:
 * All CardEffect implementations are interchangeable in ActivateSpellCommand.
 * Any CardEffect instance can be used wherever CardEffect is expected.
 *
 * @example
 * ```typescript
 * // Usage in ActivateSpellCommand
 * const cardId = parseInt(cardInstance.cardId, 10);
 * const effect = CardEffectRegistry.get(cardId);
 *
 * if (effect) {
 *   if (!effect.canActivate(state)) {
 *     return createFailureResult(state, "Cannot activate card effect");
 *   }
 *   const steps = effect.createSteps(state);
 *   effectResolutionStore.startResolution(steps);
 * }
 * ```
 */
export interface CardEffect {
  /**
   * Check if the card effect can be activated
   *
   * Validation Order (Template Method Pattern in subclasses):
   * 1. Game-over check (SpellEffect)
   * 2. Phase check (NormalSpellEffect, QuickPlaySpellEffect, etc.)
   * 3. Card-specific validation (PotOfGreedEffect: deck >= 2)
   *
   * @param state - Current game state (immutable)
   * @returns true if effect can be activated, false otherwise
   *
   * @example
   * ```typescript
   * // PotOfGreedEffect
   * canActivate(state: GameState): boolean {
   *   if (state.result.isGameOver) return false;
   *   if (state.phase !== "Main1") return false;
   *   return state.zones.deck.length >= 2;
   * }
   * ```
   */
  canActivate(state: GameState): boolean;

  /**
   * Create effect resolution steps
   *
   * Returns an array of EffectResolutionStep to be executed sequentially.
   * Each step contains:
   * - id: Unique identifier for the step
   * - title: User-facing title (displayed in UI)
   * - message: Detailed description (displayed in UI)
   * - action: Function to execute the effect (GameState mutation via Commands)
   *
   * @param state - Current game state (immutable)
   * @returns Array of EffectResolutionStep to be executed
   *
   * @example
   * ```typescript
   * // PotOfGreedEffect
   * createSteps(state: GameState): EffectResolutionStep[] {
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
  createSteps(state: GameState): EffectResolutionStep[];
}
