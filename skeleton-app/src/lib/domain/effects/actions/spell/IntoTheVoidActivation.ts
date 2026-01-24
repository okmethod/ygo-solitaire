/**
 * IntoTheVoidActivation - 《無の煉獄》(Into the Void)
 *
 * Card ID: 93946239 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、手札が3枚以上（発動前）、デッキに1枚以上
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 1枚ドロー、エンドフェーズ効果登録（手札全破棄）、墓地へ送る
 *
 * @module domain/effects/actions/spell/IntoTheVoidActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { drawStep } from "$lib/domain/effects/steps/draws";
import { queueEndPhaseEffectStep } from "$lib/domain/effects/steps/endPhase";
import { discardAllHandEndPhaseStep } from "$lib/domain/effects/steps/discards";

/**
 * IntoTheVoidActivation
 *
 * Extends NormalSpellAction for Into the Void implementation.
 */
export class IntoTheVoidActivation extends NormalSpellAction {
  constructor() {
    super(93946239);
  }

  /**
   * Card-specific activation condition:
   * - Hand must have at least 2 cards (activation requirement: 3+ cards including this card)
   *   Note: This is checked AFTER the card moves to field, so original hand had 3+ cards
   * - Deck must have at least 1 card
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // Card text: "自分の手札が３枚以上の場合に発動できる"
    // (Card is already moved to field when this is called during execution)
    if (state.zones.hand.length < 2) {
      return false;
    }

    // Need at least 1 card in deck to draw
    return state.zones.deck.length >= 1;
  }

  /**
   * RESOLUTION: Draw 1 card → Register end phase effect (discard all hand)
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    // エンドフェイズ手札全破棄効果を作成
    const endPhaseDiscardEffect = discardAllHandEndPhaseStep();

    return [
      // Step 1: 1枚ドロー
      drawStep(1),

      // Step 2: エンドフェイズ効果を登録
      queueEndPhaseEffectStep(endPhaseDiscardEffect, {
        summary: "エンドフェイズ効果を登録",
        description: "エンドフェイズに手札を全て捨てる効果を登録します",
      }),
    ];
  }
}
