/**
 * MagicalMalletActivation - Magical Mallet (打ち出の小槌) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 85852291
 * - Card Name: Magical Mallet (打ち出の小槌)
 * - Card Type: Normal Spell
 * - Effect: Return any number of cards from your hand to the deck, shuffle the deck, then draw the same number of cards.
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses step builders for card selection, return to deck, shuffle, draw, and graveyard operations
 *
 * @module domain/effects/actions/spell/MagicalMalletActivation
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import {
  createCardSelectionStep,
  createReturnToDeckStep,
  createShuffleStep,
  createDrawStep,
  createSendToGraveyardStep,
} from "../../builders/stepBuilders";

/**
 * MagicalMalletActivation - Magical Mallet ChainableAction
 *
 * Extends NormalSpellAction for Magical Mallet card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(85852291, new MagicalMalletActivation());
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
export class MagicalMalletActivation extends NormalSpellAction {
  constructor() {
    super(85852291);
  }

  /**
   * Card-specific activation condition: Magical Mallet can be activated even with empty hand
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected additionalActivationConditions(_state: GameState): boolean {
    return true;
  }

  /**
   * RESOLUTION: Select cards, return to deck, shuffle, draw same number, then send to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    let selectedInstanceIds: string[] = [];

    return [
      // Step 1: Select cards to return (0 to hand.length)
      createCardSelectionStep({
        id: "magical-mallet-select",
        summary: "手札を選択",
        description: "デッキに戻すカードを選択してください（0枚から全てまで選択可能）",
        availableCards: [],
        minCards: 0,
        maxCards: 100, // Will be capped by actual hand size
        cancelable: false,
        onSelect: (currentState: GameState, selectedIds: string[]) => {
          selectedInstanceIds = selectedIds;
          return {
            success: true,
            newState: currentState,
            message: `Selected ${selectedIds.length} cards to return`,
          };
        },
      }),

      // Step 2: Return selected cards to deck + Shuffle (combined for existing test compatibility)
      {
        id: "magical-mallet-return-shuffle",
        summary: "デッキに戻してシャッフル",
        description: "選択したカードをデッキに戻し、デッキをシャッフルします",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          if (selectedInstanceIds.length === 0) {
            return {
              success: true,
              newState: currentState,
              message: "No cards to return",
            };
          }

          // Return cards to deck
          const returnResult = createReturnToDeckStep(selectedInstanceIds).action(currentState);
          if (!returnResult.success) {
            return returnResult;
          }

          // Shuffle deck
          const shuffleResult = createShuffleStep().action(returnResult.newState);
          return shuffleResult;
        },
      },

      // Step 3: Draw same number of cards
      {
        id: "magical-mallet-draw",
        summary: "カードをドロー",
        description: "戻した枚数と同じ枚数をドローします",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          if (selectedInstanceIds.length === 0) {
            return {
              success: true,
              newState: currentState,
              message: "No cards to draw",
            };
          }

          const result = createDrawStep(selectedInstanceIds.length).action(currentState);
          return result;
        },
      },

      // Step 5: Send spell card to graveyard
      createSendToGraveyardStep(activatedCardInstanceId, this.cardId),
    ];
  }
}
