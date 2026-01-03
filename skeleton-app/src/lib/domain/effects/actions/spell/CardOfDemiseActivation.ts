/**
 * CardOfDemiseActivation - Card of Demise (命削りの宝札) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 59750328
 * - Card Name: Card of Demise (命削りの宝札)
 * - Card Type: Normal Spell
 * - Effect: Draw cards until you have 3 cards in your hand, then during the End Phase, send your entire hand to the Graveyard.
 *   You can only activate 1 "Card of Demise" per turn. You cannot Special Summon during the turn you activate this card.
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses createDrawUntilCountStep for drawing until hand = 3
 * - Uses createAddEndPhaseEffectStep for delayed discard effect
 * - Implements once-per-turn constraint via activatedOncePerTurnCards
 *
 * Note: Damage negation effect is out of scope (先行1ターンキルでは不要)
 *
 * @module domain/effects/actions/spell/CardOfDemiseActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import {
  createDrawUntilCountStep,
  createAddEndPhaseEffectStep,
  createSendToGraveyardStep,
} from "../../builders/stepBuilders";
import { sendToGraveyard } from "../../../models/Zone";
import { getCardNameWithBrackets, getCardData } from "../../../registries/CardDataRegistry";

/**
 * CardOfDemiseActivation - Card of Demise ChainableAction
 *
 * Extends NormalSpellAction for Card of Demise card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(59750328, new CardOfDemiseActivation());
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createActivationSteps(_state: GameState): EffectResolutionStep[] {
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

          const newState: GameState = {
            ...currentState,
            activatedOncePerTurnCards: newActivatedCards,
          };

          return {
            success: true,
            newState,
            message: `${cardData.jaName} activated`,
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: Draw until hand = 3 → Register end phase effect (discard all hand) → Send this card to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    // Create end phase discard effect
    const endPhaseDiscardEffect: EffectResolutionStep = {
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

        const newState: GameState = {
          ...state,
          zones: updatedZones,
        };

        return {
          success: true,
          newState,
          message: `Discarded all ${handCards.length} cards from hand (Card of Demise effect)`,
        };
      },
    };

    return [
      // Step 1: Draw until hand = 3
      createDrawUntilCountStep(3, {
        description: "手札が3枚になるようにデッキからドローします",
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
