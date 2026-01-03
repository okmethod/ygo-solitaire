/**
 * MagicalStoneExcavationActivation - Magical Stone Excavation (魔法石の採掘) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 98494543
 * - Card Name: Magical Stone Excavation (魔法石の採掘)
 * - Card Type: Normal Spell
 * - Effect: Discard 2 cards; add 1 Spell Card from your Graveyard to your hand
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses step builders for discard, graveyard search, and graveyard operations
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
 * MagicalStoneExcavationActivation - Magical Stone Excavation ChainableAction
 *
 * Extends NormalSpellAction for Magical Stone Excavation card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(98494543, new MagicalStoneExcavationActivation());
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
