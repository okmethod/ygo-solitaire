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

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { drawStep } from "$lib/domain/effects/steps/autoMovements";
import { createDiscardCardsSelectionStep } from "$lib/domain/effects/steps/handDiscard";

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
   *
   * 効果の流れ:
   * 1. デッキから3枚ドローする
   * 2. 手札から2枚を選んで墓地へ送る（プレイヤーが選択）
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: デッキから3枚ドロー
      drawStep(3),

      // Step 2: 手札から2枚選んで墓地へ送る
      createDiscardCardsSelectionStep({
        id: "graceful-charity-discard",
        summary: "手札を2枚捨てる",
        description: "手札から2枚選んで墓地へ送ってください",
        cardCount: 2,
        cancelable: false,
      }),
    ];
  }
}
