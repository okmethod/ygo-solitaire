/**
 * MagicalStoneExcavationActivation - 《魔法石の採掘》(Magical Stone Excavation)
 *
 * Card ID: 98494543 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、墓地に魔法カードが1枚以上
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 手札から2枚破棄、墓地から魔法カード1枚選んで手札に加える、墓地へ送る
 *
 * @module domain/effects/actions/spell/MagicalStoneExcavationActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { selectAndDiscardStep } from "$lib/domain/effects/steps/discards";
import { salvageFromGraveyardStep } from "$lib/domain/effects/steps/searches";

/**
 * MagicalStoneExcavationActivation
 *
 * Extends NormalSpellAction for Magical Stone Excavation implementation.
 */
export class MagicalStoneExcavationActivation extends NormalSpellAction {
  constructor() {
    super(98494543);
  }

  /**
   * Card-specific activation condition:
   * - Hand must have at least 2 cards (to discard) (T037)
   * - Graveyard must have at least 1 spell card
   *
   * Note: This method is called twice by ActivateSpellCommand:
   * 1. Before activation (with this card still in hand) - need 3 cards: this card + 2 to discard
   * 2. After moving to field (with this card on field) - need 2 cards in hand to discard
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // Check if this card is in hand. If yes, we need 3 cards total (this card + 2 to discard)
    // If this card is already on field (after activation), we need 2 cards in hand (T037)
    const thisCardInHand = state.zones.hand.some((card) => card.id === this.cardId);
    const requiredHandSize = thisCardInHand ? 3 : 2;

    if (state.zones.hand.length < requiredHandSize) {
      return false;
    }

    // Need at least 1 spell card in graveyard to target
    const spellCardsInGraveyard = state.zones.graveyard.filter((card) => card.type === "spell");
    return spellCardsInGraveyard.length >= 1;
  }

  /**
   * RESOLUTION: Discard 2 cards → Select 1 spell from graveyard → Add to hand
   *
   * 効果の流れ:
   * 1. 手札から2枚を選んで墓地へ送る（コスト）
   * 2. 墓地から魔法カード1枚を選んで手札に加える
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: 手札から2枚選んで墓地へ送る（コスト）
      selectAndDiscardStep(2),

      // Step 2: 墓地から魔法カード1枚を選んで手札に加える
      salvageFromGraveyardStep({
        id: `magical-stone-excavation-search-${activatedCardInstanceId}`,
        summary: "魔法カード1枚をサルベージ",
        description: "墓地から魔法カード1枚を選択し、手札に加えます",
        filter: (card) => card.type === "spell",
        minCards: 1,
        maxCards: 1,
        cancelable: false,
      }),
    ];
  }
}
