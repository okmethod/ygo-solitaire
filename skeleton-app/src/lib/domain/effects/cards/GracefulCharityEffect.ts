/**
 * GracefulCharityEffect - Graceful Charity (天使の施し) card effect implementation
 *
 * Card Information:
 * - Card ID: 79571449
 * - Card Name: Graceful Charity (天使の施し)
 * - Card Type: Normal Spell
 * - Effect: Draw 3 cards from deck, then discard 2 cards from hand
 *
 * Activation Conditions:
 * - Game is not over
 * - Current phase is Main Phase 1
 * - Deck has at least 3 cards
 *
 * Effect Resolution:
 * 1. Draw 3 cards from deck to hand
 * 2. Player selects 2 cards from hand
 * 3. Discard selected 2 cards to graveyard
 *
 * @module domain/effects/cards/GracefulCharityEffect
 */

import { NormalSpellEffect } from "../bases/NormalSpellEffect";
import type { GameState } from "../../models/GameState";
import type { EffectResolutionStep } from "../EffectResolutionStep";
import { drawCards } from "../../models/Zone";
import { checkVictoryConditions } from "../../rules/VictoryRule";

/**
 * GracefulCharityEffect - Graceful Charity card effect
 *
 * Inheritance Hierarchy:
 * ```
 * CardEffect (interface)
 *   ↓
 * SpellEffect (abstract class) - Game-over check
 *   ↓
 * NormalSpellEffect (abstract class) - Main Phase check
 *   ↓
 * GracefulCharityEffect (this class) - Deck size check (>= 3) + Draw 3 + Discard 2
 * ```
 *
 * Validation Flow:
 * 1. SpellEffect.canActivate() → Game-over check
 * 2. NormalSpellEffect.canActivateSpell() → Main Phase check
 * 3. GracefulCharityEffect.canActivateNormalSpell() → Deck size check (>= 3)
 *
 * @example
 * ```typescript
 * // Usage in CardEffectRegistry initialization
 * CardEffectRegistry.register(79571449, new GracefulCharityEffect());
 *
 * // Usage in ActivateSpellCommand
 * const cardId = 79571449; // Graceful Charity
 * const effect = CardEffectRegistry.get(cardId);
 *
 * if (effect && effect.canActivate(state)) {
 *   const steps = effect.createSteps(state);
 *   effectResolutionStore.startResolution(steps);
 * }
 * ```
 */
export class GracefulCharityEffect extends NormalSpellEffect {
  /**
   * Check if Graceful Charity can be activated
   *
   * Graceful Charity specific validation:
   * - Deck must have at least 3 cards (to draw 3 cards)
   *
   * @param state - Current game state (immutable)
   * @returns true if deck has at least 3 cards, false otherwise
   *
   * @example
   * ```typescript
   * // Sufficient deck
   * const state = {
   *   zones: { deck: [card1, card2, card3, card4] }
   * };
   * effect.canActivate(state); // true
   *
   * // Insufficient deck
   * const state = {
   *   zones: { deck: [card1, card2] }
   * };
   * effect.canActivate(state); // false
   * ```
   */
  protected canActivateNormalSpell(state: GameState): boolean {
    // Graceful Charity specific validation: Deck must have at least 3 cards
    return state.zones.deck.length >= 3;
  }

  /**
   * Create effect resolution steps for Graceful Charity
   *
   * Effect Resolution:
   * 1. Draw 3 cards from deck to hand
   * 2. Wait for player to select 2 cards from hand (via CardSelectionModal)
   * 3. Discard selected 2 cards to graveyard
   *
   * @param state - Current game state (immutable)
   * @returns Array of EffectResolutionStep (2 steps for Graceful Charity)
   *
   * @example
   * ```typescript
   * const steps = effect.createSteps(state);
   * // [
   * //   {
   * //     id: "graceful-charity-draw",
   * //     title: "カードをドローします",
   * //     message: "デッキから3枚ドローします",
   * //     action: (state) => { ... }
   * //   },
   * //   {
   * //     id: "graceful-charity-discard",
   * //     title: "カードを破棄します",
   * //     message: "手札から2枚選んで破棄してください",
   * //     action: (state) => { ... }
   * //   }
   * // ]
   * ```
   */
  createSteps(): EffectResolutionStep[] {
    return [
      // Step 1: Draw 3 cards
      {
        id: "graceful-charity-draw",
        title: "カードをドローします",
        message: "デッキから3枚ドローします",
        action: (state: GameState) => {
          // Draw 3 cards directly using domain functions
          // GameState is injected by confirmCurrentStep() (Dependency Injection)

          // Validate deck has enough cards
          if (state.zones.deck.length < 3) {
            return {
              success: false,
              newState: state,
              error: "Cannot draw 3 cards. Not enough cards in deck.",
            };
          }

          // Draw cards (returns new immutable zones object)
          const newZones = drawCards(state.zones, 3);

          // Create new state with drawn cards
          const newState: GameState = {
            ...state,
            zones: newZones,
          };

          // Check victory conditions after drawing
          const victoryResult = checkVictoryConditions(newState);

          // Update game result if victory/defeat occurred
          const finalState: GameState = {
            ...newState,
            result: victoryResult,
          };

          return {
            success: true,
            newState: finalState,
            message: "Drew 3 cards",
          };
        },
      },

      // Step 2: Discard 2 cards (player selection required)
      {
        id: "graceful-charity-discard",
        title: "カードを破棄します",
        message: "手札から2枚選んで破棄してください",
        action: (state: GameState) => {
          // This step waits for player input via CardSelectionModal
          // The actual discard is performed by the onConfirm callback
          // which is set up by CardEffectPanel when rendering this step

          // For now, just return success to allow the step to proceed
          // The actual discard logic will be handled by cardSelectionStore
          return {
            success: true,
            newState: state,
            message: "Waiting for card selection",
          };
        },
      },
    ];
  }
}
