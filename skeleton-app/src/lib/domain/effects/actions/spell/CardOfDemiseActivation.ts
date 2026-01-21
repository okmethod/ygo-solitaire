/**
 * CardOfDemiseActivation - 《命削りの宝札》(Card of Demise)
 *
 * Card ID: 59750328 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、1ターンに1度制限
 * - ACTIVATION: 発動通知、1ターンに1度制限の記録
 * - RESOLUTION: 手札が3枚になるようにドロー、エンドフェイズ効果登録（手札全破棄）、墓地へ送る
 *
 * @module domain/effects/actions/spell/CardOfDemiseActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { createAddEndPhaseEffectStep } from "../../builders/stepBuilders";
import { fillHandsStep } from "$lib/domain/effects/steps/autoMovements";
import { sendToGraveyard } from "$lib/domain/models/Zone";
import { getCardNameWithBrackets, getCardData } from "$lib/domain/registries/CardDataRegistry";

/**
 * CardOfDemiseActivation
 *
 * Extends NormalSpellAction for Card of Demise implementation.
 */
export class CardOfDemiseActivation extends NormalSpellAction {
  constructor() {
    super(59750328);
  }

  /**
   * Card-specific activation condition:
   * - Card must not be in activatedOncePerTurnCards (once-per-turn constraint)
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // Once-per-turn constraint: check if card already activated this turn
    if (state.activatedOncePerTurnCards.has(this.cardId)) {
      return false;
    }

    return true;
  }

  /**
   * ACTIVATION: Override to add once-per-turn tracking
   *
   * Adds this card's ID to activatedOncePerTurnCards set.
   */
  createActivationSteps(_state: GameState): AtomicStep[] {
    const cardData = getCardData(this.cardId);
    return [
      {
        id: `${this.cardId}-activation`,
        summary: "カード発動",
        description: `${getCardNameWithBrackets(this.cardId)}を発動します`,
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // Add to once-per-turn tracking
          const newActivatedCards = new Set(currentState.activatedOncePerTurnCards);
          newActivatedCards.add(this.cardId);

          const updatedState: GameState = {
            ...currentState,
            activatedOncePerTurnCards: newActivatedCards,
          };

          return {
            success: true,
            updatedState,
            message: `${cardData.jaName} activated`,
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: Draw until hand = 3 → Register end phase effect (discard all hand)
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    // Create end phase discard effect
    const endPhaseDiscardEffect: AtomicStep = {
      id: `card-of-demise-end-phase-discard-${activatedCardInstanceId}`,
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
          message: `Discarded all ${handCards.length} cards from hand (Card of Demise effect)`,
        };
      },
    };

    return [
      // Step 1: 手札が3枚になるまでドロー
      fillHandsStep(3, {
        description: "手札が3枚になるようにデッキからドローします",
      }),

      // Step 2: Register end phase effect
      createAddEndPhaseEffectStep(endPhaseDiscardEffect, {
        summary: "エンドフェイズ効果を登録",
        description: "エンドフェイズに手札を全て捨てる効果を登録します",
      }),
    ];
  }
}
