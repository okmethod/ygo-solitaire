/**
 * GracefulCharityActivation - Graceful Charity (天使の施し) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 79571449
 * - Card Name: Graceful Charity (天使の施し)
 * - Card Type: Normal Spell
 * - Effect: Draw 3 cards from deck, then discard 2 cards from hand
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses step builders for draw, card selection, and graveyard operations
 *
 * @module domain/effects/actions/spell/GracefulCharityActivation
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createDrawStep, createSendToGraveyardStep, createCardSelectionStep } from "../../builders/stepBuilders";
import { DiscardCardsCommand } from "../../../commands/DiscardCardsCommand";

/**
 * GracefulCharityActivation - Graceful Charity ChainableAction
 *
 * Extends NormalSpellAction for Graceful Charity card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(79571449, new GracefulCharityActivation());
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
export class GracefulCharityActivation extends NormalSpellAction {
  constructor() {
    super(79571449);
  }

  /**
   * Card-specific activation condition: Deck must have at least 3 cards
   */
  protected additionalActivationConditions(state: GameState): boolean {
    return state.zones.deck.length >= 3;
  }

  /**
   * RESOLUTION: Draw 3 cards, discard 2 cards (player selection), then send this card to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Draw 3 cards
      createDrawStep(3),

      // Step 2: Discard 2 cards (player selection required)
      createCardSelectionStep({
        id: "graceful-charity-discard",
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

      // Step 3: Send spell card to graveyard
      createSendToGraveyardStep(activatedCardInstanceId, this.cardId),
    ];
  }
}
