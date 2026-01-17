/**
 * GracefulCharityActivation - 《天使の施し》(Graceful Charity)
 *
 * Card ID: 79571449 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、デッキに3枚以上
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 3枚ドロー、手札から2枚選んで破棄、墓地へ送る
 *
 * @module domain/effects/actions/spell/GracefulCharityActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createDrawStep, createCardSelectionStep } from "../../builders/stepBuilders";
import { DiscardCardsCommand } from "../../../commands/DiscardCardsCommand";

/**
 * GracefulCharityActivation
 *
 * Extends NormalSpellAction for Graceful Charity implementation.
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
   * RESOLUTION: Draw 3 cards, discard 2 cards (player selection)
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
              updatedState: currentState,
              error: "Must select exactly 2 cards to discard",
            };
          }

          // Execute discard command
          const command = new DiscardCardsCommand(selectedInstanceIds);
          return command.execute(currentState);
        },
      }),
    ];
  }
}
