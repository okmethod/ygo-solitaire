/**
 * PotOfDualityActivation - Pot of Duality (強欲で謙虚な壺) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 98645731
 * - Card Name: Pot of Duality (強欲で謙虚な壺)
 * - Card Type: Normal Spell
 * - Effect: Excavate the top 3 cards of your Deck, add 1 of them to your hand, then shuffle the rest back into the Deck.
 *   You can only activate 1 "Pot of Duality" per turn. You cannot Special Summon during the turn you activate this card.
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses createSearchFromDeckTopStep for deck excavation
 * - Implements once-per-turn constraint via activatedOncePerTurnCards
 *
 * @module domain/effects/actions/spell/PotOfDualityActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createSearchFromDeckTopStep, createSendToGraveyardStep } from "../../builders/stepBuilders";
import { getCardNameWithBrackets, getCardData } from "../../../registries/CardDataRegistry";

/**
 * PotOfDualityActivation - Pot of Duality ChainableAction
 *
 * Extends NormalSpellAction for Pot of Duality card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(98645731, new PotOfDualityActivation());
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
export class PotOfDualityActivation extends NormalSpellAction {
  constructor() {
    super(98645731);
  }

  /**
   * Card-specific activation condition:
   * - Deck must have at least 3 cards
   * - Card must not be in activatedOncePerTurnCards (once-per-turn constraint)
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // Need at least 3 cards in deck to excavate
    if (state.zones.deck.length < 3) {
      return false;
    }

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
   * RESOLUTION: Excavate top 3 cards → Select 1 → Add to hand → Return rest to deck → Send this card to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Excavate top 3 cards and select 1 to add to hand
      createSearchFromDeckTopStep({
        id: `pot-of-duality-search-${activatedCardInstanceId}`,
        summary: "デッキの上から3枚を確認",
        description: "デッキの上から3枚を確認し、1枚を選んで手札に加えてください。残りはデッキに戻ります",
        count: 3,
        minCards: 1,
        maxCards: 1,
        cancelable: false,
      }),

      // Step 2: Send this card to graveyard
      createSendToGraveyardStep(activatedCardInstanceId, this.cardId),
    ];
  }
}
