/**
 * MagicalMalletActivation - 《打ち出の小槌》(Magical Mallet)
 *
 * Card ID: 85852291 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 手札から任意枚数選択、デッキに戻してシャッフル、同じ枚数ドロー、墓地へ送る
 *
 * @module domain/effects/actions/spell/MagicalMalletActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { createReturnToDeckStep } from "../../builders/stepBuilders";
import { drawStep } from "$lib/domain/effects/steps/autoMovements";
import { selectCardsStep } from "$lib/domain/effects/steps/userInteractions";
import { shuffleDeckStep } from "$lib/domain/effects/steps/deckOperations";

/**
 * MagicalMalletActivation
 *
 * Extends NormalSpellAction for Magical Mallet implementation.
 */
export class MagicalMalletActivation extends NormalSpellAction {
  constructor() {
    super(85852291);
  }

  /**
   * Card-specific activation condition: Magical Mallet can be activated even with empty hand
   */
  protected additionalActivationConditions(_state: GameState): boolean {
    return true;
  }

  /**
   * RESOLUTION: Select cards, return to deck, shuffle, draw same number
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    let selectedInstanceIds: string[] = [];

    return [
      // Step 1: Select cards to return (0 to hand.length)
      selectCardsStep({
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
            updatedState: currentState,
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
              updatedState: currentState,
              message: "No cards to return",
            };
          }

          // Return cards to deck
          const returnResult = createReturnToDeckStep(selectedInstanceIds).action(currentState);
          if (!returnResult.success) {
            return returnResult;
          }

          // Shuffle deck
          const shuffleResult = shuffleDeckStep().action(returnResult.updatedState);
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
              updatedState: currentState,
              message: "No cards to draw",
            };
          }

          const result = drawStep(selectedInstanceIds.length).action(currentState);
          return result;
        },
      },
    ];
  }
}
