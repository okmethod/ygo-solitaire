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

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import {
  createCardSelectionStep,
  createSearchFromGraveyardStep,
  createSendToGraveyardStep,
} from "../../builders/stepBuilders";
import { DiscardCardsCommand } from "../../../commands/DiscardCardsCommand";

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
   * - Graveyard must have at least 1 spell card
   *
   * Note: Hand size check (need 2+ cards to discard) is handled by the discard step itself
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // Need at least 1 spell card in graveyard to target
    const spellCardsInGraveyard = state.zones.graveyard.filter((card) => card.type === "spell");
    return spellCardsInGraveyard.length >= 1;
  }

  /**
   * RESOLUTION: Discard 2 cards → Select 1 spell from graveyard → Add to hand → Send this card to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Discard 2 cards from hand
      createCardSelectionStep({
        id: "magical-stone-excavation-discard",
        summary: "手札を捨てる",
        description: "手札から2枚選んで捨ててください",
        availableCards: [], // Empty array means "use current hand"
        minCards: 2,
        maxCards: 2,
        cancelable: false,
        onSelect: (currentState: GameState, selectedInstanceIds: string[]) => {
          // Validate selection
          if (selectedInstanceIds.length !== 2) {
            return {
              success: false,
              newState: currentState,
              error: "Must select exactly 2 cards to discard",
            };
          }

          // Execute discard command
          const command = new DiscardCardsCommand(selectedInstanceIds);
          return command.execute(currentState);
        },
      }),

      // Step 2: Select 1 spell card from graveyard and add to hand
      createSearchFromGraveyardStep({
        id: `magical-stone-excavation-search-${activatedCardInstanceId}`,
        summary: "墓地から魔法カードを回収",
        description: "墓地から魔法カードを1枚選んで手札に加えてください",
        filter: (card) => card.type === "spell",
        minCards: 1,
        maxCards: 1,
        cancelable: false,
      }),

      // Step 3: Send this card to graveyard
      createSendToGraveyardStep(activatedCardInstanceId, this.cardId),
    ];
  }
}
