/**
 * CardOfDemiseActivation - 《命削りの宝札》(Card of Demise)
 *
 * Card ID: 59750328 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、1ターンに1度制限
 * - ACTIVATION: 発動通知、1ターンに1度制限の記録
 * - RESOLUTION: 手札が3枚になるようにドロー、エンドフェイズ効果登録（手札全破棄）、墓地へ送る
 *
 * @module domain/effects/actions/spell/CardOfDemiseActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { fillHandsStep } from "$lib/domain/effects/steps/draws";
import { queueEndPhaseEffectStep } from "$lib/domain/effects/steps/endPhase";
import { discardAllHandStep } from "$lib/domain/effects/steps/discards";

/**
 * CardOfDemiseActivation
 *
 * Extends NormalSpellAction for Card of Demise implementation.
 */
export class CardOfDemiseActivation extends NormalSpellAction {
  constructor() {
    super(59750328);
  }

  /**
   * Card-specific activation condition:
   * - Card must not be in activatedOncePerTurnCards (once-per-turn constraint)
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // 1ターンに1度制限: 既にこのターン発動済みでないかチェック
    if (state.activatedOncePerTurnCards.has(this.cardId)) {
      return false;
    }

    return true;
  }

  /**
   * ACTIVATION: Override to add once-per-turn tracking
   *
   * 基底クラスの createOncePerTurnActivationSteps() を使用して、
   * 1ターンに1度制限を記録します。
   */
  createActivationSteps(_state: GameState): AtomicStep[] {
    return this.createOncePerTurnActivationSteps();
  }

  /**
   * RESOLUTION: Draw until hand = 3 → Register end phase effect (discard all hand)
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    // エンドフェイズ手札全破棄効果を作成
    const endPhaseDiscardEffect = discardAllHandStep();

    return [
      // Step 1: 手札が3枚になるまでドロー
      fillHandsStep(3),

      // Step 2: エンドフェイズ効果を登録
      queueEndPhaseEffectStep(endPhaseDiscardEffect, {
        summary: "エンドフェイズ効果を登録",
        description: "エンドフェイズに手札を全て捨てる効果を登録します",
      }),
    ];
  }
}
