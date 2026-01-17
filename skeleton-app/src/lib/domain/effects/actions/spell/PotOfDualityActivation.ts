/**
 * PotOfDualityActivation - 《強欲で謙虚な壺》(Pot of Duality)
 *
 * Card ID: 98645731 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、デッキに3枚以上、1ターンに1度制限
 * - ACTIVATION: 発動通知、1ターンに1度制限の記録
 * - RESOLUTION: デッキトップ3枚確認、1枚選んで手札に加える、残りをデッキに戻す、墓地へ送る
 *
 * @module domain/effects/actions/spell/PotOfDualityActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createSearchFromDeckTopStep } from "../../builders/stepBuilders";
import { getCardNameWithBrackets, getCardData } from "../../../registries/CardDataRegistry";

/**
 * PotOfDualityActivation
 *
 * Extends NormalSpellAction for Pot of Duality implementation.
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
   * RESOLUTION: Excavate top 3 cards → Select 1 → Add to hand → Return rest to deck
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
    ];
  }
}
