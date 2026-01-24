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

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { searchFromDeckTopStep } from "$lib/domain/effects/steps/searches";

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
  protected individualConditions(state: GameState): boolean {
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
   * RESOLUTION: Excavate top 3 cards → Select 1 → Add to hand → Return rest to deck
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: Excavate top 3 cards and select 1 to add to hand
      searchFromDeckTopStep({
        id: `pot-of-duality-search-${_activatedCardInstanceId}`,
        summary: "デッキトップ3枚から1枚をサーチ",
        description: "デッキトップ3枚から1枚を選択し、手札に加えます",
        count: 3,
        minCards: 1,
        maxCards: 1,
        cancelable: false,
      }),
    ];
  }
}
