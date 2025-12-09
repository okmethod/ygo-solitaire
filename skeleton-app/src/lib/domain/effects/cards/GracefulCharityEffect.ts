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
import { DiscardCardsCommand } from "../../../application/commands/DiscardCardsCommand";

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
   * Create card-specific effect resolution steps for Graceful Charity
   *
   * Effect Resolution:
   * 1. Draw 3 cards from deck to hand
   * 2. Wait for player to select 2 cards from hand (via CardSelectionModal)
   * 3. Discard selected 2 cards to graveyard
   *
   * Note: Graveyard-sending step is automatically appended by NormalSpellEffect
   *
   * @param state - Current game state (immutable)
   * @returns Array of card-specific EffectResolutionStep (2 steps for Graceful Charity)
   *
   * @example
   * ```typescript
   * const steps = effect.createCardSteps(state);
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
   * //     cardSelectionConfig: { ... },
   * //     action: (state, selectedInstanceIds) => { ... }
   * //   }
   * // ]
   * // NormalSpellEffect will append graveyard-sending step
   * ```
   */
  protected createCardSteps(state: GameState): EffectResolutionStep[] {
    return [
      // Step 1: Draw 3 cards
      {
        id: "graceful-charity-draw",
        title: "カードをドローします",
        message: "デッキから3枚ドローします",
        action: (currentState: GameState) => {
          // Draw 3 cards directly using domain functions
          // GameState is injected by confirmCurrentStep() (Dependency Injection)

          // Validate deck has enough cards
          if (currentState.zones.deck.length < 3) {
            return {
              success: false,
              newState: currentState,
              error: "Cannot draw 3 cards. Not enough cards in deck.",
            };
          }

          // Draw cards (returns new immutable zones object)
          const newZones = drawCards(currentState.zones, 3);

          // Create new state with drawn cards
          const newState: GameState = {
            ...currentState,
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
        // Card selection configuration (Domain Layer)
        // Application Layer will open CardSelectionModal with this config
        cardSelectionConfig: {
          availableCards: state.zones.hand,
          minCards: 2,
          maxCards: 2,
          title: "カードを破棄",
          message: "手札から2枚選んで破棄してください",
        },
        // Action receives selected card instance IDs from user selection
        action: (currentState: GameState, selectedInstanceIds?: string[]) => {
          // Validate selectedInstanceIds is provided
          if (!selectedInstanceIds || selectedInstanceIds.length !== 2) {
            return {
              success: false,
              newState: currentState,
              error: "Must select exactly 2 cards to discard",
            };
          }

          // Execute discard command
          const command = new DiscardCardsCommand(selectedInstanceIds);
          return command.execute(currentState);
        },
      },
    ];
  }
}
