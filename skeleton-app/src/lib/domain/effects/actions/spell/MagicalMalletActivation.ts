/**
 * MagicalMalletActivation - 《打ち出の小槌》(Magical Mallet)
 *
 * Card ID: 85852291 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 手札から任意枚数選択、デッキに戻してシャッフル、同じ枚数ドロー
 *
 * @module domain/effects/actions/spell/MagicalMalletActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { selectReturnShuffleDrawStep } from "$lib/domain/effects/steps/compositeOperations";

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
   *
   * 効果の流れ:
   * 1. 手札から1枚以上選択、デッキに戻してシャッフル、同じ枚数ドロー
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [selectReturnShuffleDrawStep({ min: 1 })];
  }
}
