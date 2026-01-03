/**
 * IntoTheVoidActivation - Into the Void (無の煉獄) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 93946239
 * - Card Name: Into the Void (無の煉獄)
 * - Card Type: Normal Spell
 * - Effect: Draw 1 card. During the End Phase of this turn, discard your entire hand
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses step builders for draw and end phase effect registration
 *
 * @module domain/effects/actions/spell/IntoTheVoidActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createDrawStep, createAddEndPhaseEffectStep, createSendToGraveyardStep } from "../../builders/stepBuilders";
import { sendToGraveyard } from "../../../models/Zone";

/**
 * IntoTheVoidActivation - Into the Void ChainableAction
 *
 * Extends NormalSpellAction for Into the Void card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(93946239, new IntoTheVoidActivation());
 *
 * // Usage in ActivateSpellCommand
 * const action = ChainableActionRegistry.get(cardId);
 * if (action && action.canActivate(state)) {
 *   const activationSteps = action.createActivationSteps(state);
 *   const resolutionSteps = action.createResolutionSteps(state, instanceId);
 *   // Application Layer handles execution
 * }
 * ```
 */
export class IntoTheVoidActivation extends NormalSpellAction {
  constructor() {
    super(93946239);
  }

  /**
   * Card-specific activation condition:
   * - Hand must have at least 2 cards (activation requirement: 3+ cards including this card)
   *   Note: This is checked AFTER the card moves to field, so original hand had 3+ cards
   * - Deck must have at least 1 card
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // Card text: "自分の手札が３枚以上の場合に発動できる"
    // (Card is already moved to field when this is called during execution)
    if (state.zones.hand.length < 2) {
      return false;
    }

    // Need at least 1 card in deck to draw
    return state.zones.deck.length >= 1;
  }

  /**
   * RESOLUTION: Draw 1 card → Register end phase effect (discard all hand) → Send this card to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    // Create end phase discard effect
    const endPhaseDiscardEffect: EffectResolutionStep = {
      id: `into-the-void-end-phase-discard-${activatedCardInstanceId}`,
      summary: "手札を全て捨てる",
      description: "エンドフェイズに手札を全て捨てます",
      notificationLevel: "info",
      action: (state: GameState) => {
        // Discard all cards in hand
        let updatedZones = state.zones;
        const handCards = [...state.zones.hand]; // Copy to avoid mutation during iteration

        for (const card of handCards) {
          updatedZones = sendToGraveyard(updatedZones, card.instanceId);
        }

        const newState: GameState = {
          ...state,
          zones: updatedZones,
        };

        return {
          success: true,
          newState,
          message: `Discarded all ${handCards.length} cards from hand (Into the Void effect)`,
        };
      },
    };

    return [
      // Step 1: Draw 1 card
      createDrawStep(1, {
        description: "デッキから1枚ドローします",
      }),

      // Step 2: Register end phase effect
      createAddEndPhaseEffectStep(endPhaseDiscardEffect, {
        summary: "エンドフェイズ効果を登録",
        description: "エンドフェイズに手札を全て捨てる効果を登録します",
      }),

      // Step 3: Send this card to graveyard
      createSendToGraveyardStep(activatedCardInstanceId, this.cardId),
    ];
  }
}
