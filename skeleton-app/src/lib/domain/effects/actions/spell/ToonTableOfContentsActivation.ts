/**
 * ToonTableOfContentsActivation - 《トゥーンのもくじ》(Toon Table of Contents)
 *
 * Card ID: 89997728 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、デッキに「トゥーン」カードが1枚以上
 * - ACTIVATION: 発動通知
 * - RESOLUTION: デッキから「トゥーン」カード1枚を検索して手札に加える、墓地へ送る
 *
 * @module domain/effects/actions/spell/ToonTableOfContentsActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createSearchFromDeckByNameStep } from "../../builders/stepBuilders";

/**
 * ToonTableOfContentsActivation
 *
 * Extends NormalSpellAction for Toon Table of Contents implementation.
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
   * RESOLUTION: Search for Toon card from deck → Add to hand → Shuffle deck
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
    ];
  }
}
