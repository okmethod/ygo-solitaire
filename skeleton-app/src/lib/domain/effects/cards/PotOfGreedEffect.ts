/**
 * PotOfGreedEffect - Pot of Greed (強欲な壺) card effect implementation
 *
 * Card Information:
 * - Card ID: 55144522
 * - Card Name: Pot of Greed (強欲な壺)
 * - Card Type: Normal Spell
 * - Effect: Draw 2 cards from your deck
 *
 * Activation Conditions:
 * - Game is not over
 * - Current phase is Main Phase 1
 * - Deck has at least 2 cards
 *
 * Effect Resolution:
 * 1. Draw 2 cards from deck to hand
 *
 * @module domain/effects/cards/PotOfGreedEffect
 */

import { NormalSpellEffect } from "../bases/NormalSpellEffect";
import type { GameState } from "../../models/GameState";
import type { EffectResolutionStep } from "../EffectResolutionStep";
import { drawCards } from "../../models/Zone";
import { checkVictoryConditions } from "../../rules/VictoryRule";

/**
 * PotOfGreedEffect - Pot of Greed card effect
 *
 * Inheritance Hierarchy:
 * ```
 * CardEffect (interface)
 *   ↓
 * SpellEffect (abstract class) - Game-over check
 *   ↓
 * NormalSpellEffect (abstract class) - Main Phase check
 *   ↓
 * PotOfGreedEffect (this class) - Deck size check + Draw 2 cards
 * ```
 *
 * Validation Flow:
 * 1. SpellEffect.canActivate() → Game-over check
 * 2. NormalSpellEffect.canActivateSpell() → Main Phase check
 * 3. PotOfGreedEffect.canActivateNormalSpell() → Deck size check (>= 2)
 *
 * @example
 * ```typescript
 * // Usage in CardEffectRegistry initialization
 * CardEffectRegistry.register(55144522, new PotOfGreedEffect());
 *
 * // Usage in ActivateSpellCommand
 * const cardId = 55144522; // Pot of Greed
 * const effect = CardEffectRegistry.get(cardId);
 *
 * if (effect && effect.canActivate(state)) {
 *   const steps = effect.createSteps(state);
 *   effectResolutionStore.startResolution(steps);
 * }
 * ```
 */
export class PotOfGreedEffect extends NormalSpellEffect {
  /**
   * Check if Pot of Greed can be activated
   *
   * Pot of Greed specific validation:
   * - Deck must have at least 2 cards (to draw 2 cards)
   *
   * @param state - Current game state (immutable)
   * @returns true if deck has at least 2 cards, false otherwise
   *
   * @example
   * ```typescript
   * // Sufficient deck
   * const state = {
   *   zones: { deck: [card1, card2, card3] }
   * };
   * effect.canActivate(state); // true
   *
   * // Insufficient deck
   * const state = {
   *   zones: { deck: [card1] }
   * };
   * effect.canActivate(state); // false
   * ```
   */
  protected canActivateNormalSpell(state: GameState): boolean {
    // Pot of Greed specific validation: Deck must have at least 2 cards
    return state.zones.deck.length >= 2;
  }

  /**
   * Create card-specific effect resolution steps for Pot of Greed
   *
   * Effect Resolution:
   * 1. Draw 2 cards from deck to hand
   *
   * Note: Graveyard-sending step is automatically appended by NormalSpellEffect
   *
   * @param state - Current game state (immutable)
   * @returns Array of card-specific EffectResolutionStep (1 step for Pot of Greed)
   *
   * @example
   * ```typescript
   * const steps = effect.createCardSteps(state);
   * // [
   * //   {
   * //     id: "pot-of-greed-draw",
   * //     title: "カードをドローします",
   * //     message: "デッキから2枚ドローします",
   * //     action: () => { ... }
   * //   }
   * // ]
   * // NormalSpellEffect will append graveyard-sending step
   * ```
   */
  protected createCardSteps(): EffectResolutionStep[] {
    return [
      {
        id: "pot-of-greed-draw",
        title: "カードをドローします",
        message: "デッキから2枚ドローします",
        action: (state: GameState) => {
          // Draw 2 cards directly using domain functions
          // GameState is injected by confirmCurrentStep() (Dependency Injection)

          // Validate deck has enough cards
          if (state.zones.deck.length < 2) {
            return {
              success: false,
              newState: state,
              error: "Cannot draw 2 cards. Not enough cards in deck.",
            };
          }

          // Draw cards (returns new immutable zones object)
          const newZones = drawCards(state.zones, 2);

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
            message: "Drew 2 cards",
          };
        },
      },
    ];
  }
}
