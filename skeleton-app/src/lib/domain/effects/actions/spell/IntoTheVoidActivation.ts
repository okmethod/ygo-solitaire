/**
 * IntoTheVoidActivation - 《無の煉獄》(Into the Void)
 *
 * Card ID: 93946239 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、手札が3枚以上（発動前）、デッキに1枚以上
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 1枚ドロー、エンドフェーズ効果登録（手札全破棄）、墓地へ送る
 *
 * @module domain/effects/actions/spell/IntoTheVoidActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createDrawStep, createAddEndPhaseEffectStep, createSendToGraveyardStep } from "../../builders/stepBuilders";
import { sendToGraveyard } from "../../../models/Zone";

/**
 * IntoTheVoidActivation
 *
 * Extends NormalSpellAction for Into the Void implementation.
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

        const updatedState: GameState = {
          ...state,
          zones: updatedZones,
        };

        return {
          success: true,
          updatedState,
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
