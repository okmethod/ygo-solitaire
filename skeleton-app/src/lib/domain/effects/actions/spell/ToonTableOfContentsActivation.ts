/**
 * ToonTableOfContentsActivation - Toon Table of Contents (トゥーンのもくじ) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 89997728
 * - Card Name: Toon Table of Contents (トゥーンのもくじ)
 * - Card Type: Normal Spell
 * - Effect: Add 1 "Toon" card from your Deck to your hand.
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses createSearchFromDeckByNameStep for Toon card search
 *
 * @module domain/effects/actions/spell/ToonTableOfContentsActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createSearchFromDeckByNameStep, createSendToGraveyardStep } from "../../builders/stepBuilders";

/**
 * ToonTableOfContentsActivation - Toon Table of Contents ChainableAction
 *
 * Extends NormalSpellAction for Toon Table of Contents card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(89997728, new ToonTableOfContentsActivation());
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
export class ToonTableOfContentsActivation extends NormalSpellAction {
  constructor() {
    super(89997728);
  }

  /**
   * Card-specific activation condition:
   * - Deck must have at least 1 card with "トゥーン" (Toon) in name
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // Check if deck has at least 1 Toon card (cards with "トゥーン" or "Toon" in name)
    const toonCardsInDeck = state.zones.deck.filter(
      (card) => card.jaName.includes("トゥーン") || (card.name && card.name.includes("Toon")),
    );
    return toonCardsInDeck.length >= 1;
  }

  /**
   * RESOLUTION: Search for Toon card from deck → Add to hand → Shuffle deck → Send this card to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Search for Toon card from deck and add to hand
      createSearchFromDeckByNameStep({
        id: `toon-table-search-${activatedCardInstanceId}`,
        summary: "デッキからトゥーンカードを検索",
        description: "デッキから「トゥーン」カード1枚を選んで手札に加えてください",
        filter: (card) => card.jaName.includes("トゥーン") || (card.name && card.name.includes("Toon")),
        minCards: 1,
        maxCards: 1,
        cancelable: false,
      }),

      // Step 2: Send this card to graveyard
      createSendToGraveyardStep(activatedCardInstanceId, this.cardId),
    ];
  }
}
