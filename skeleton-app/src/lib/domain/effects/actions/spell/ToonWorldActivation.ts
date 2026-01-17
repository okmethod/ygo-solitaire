/**
 * ToonWorldActivation - 《トゥーン・ワールド》(Toon World)
 *
 * Card ID: 15259703 | Type: Spell | Subtype: Continuous
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、LP>=1000
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 1000LP支払い、フィールドに残る
 *
 * @module domain/effects/actions/spell/ToonWorldActivation
 */

import type { GameState } from "../../../models/GameState";
import type { AtomicStep } from "../../../models/AtomicStep";
import { ContinuousSpellAction } from "../../base/spell/ContinuousSpellAction";
import { createLPPaymentStep } from "../../builders/stepBuilders";

/**
 * ToonWorldActivation
 *
 * Extends ContinuousSpellAction for Toon World implementation.
 */
export class ToonWorldActivation extends ContinuousSpellAction {
  constructor() {
    super(15259703);
  }

  /**
   * Card-specific activation condition:
   * - Player LP must be >= 1000 (to pay activation cost)
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // Need at least 1000 LP to pay activation cost
    return state.lp.player >= 1000;
  }

  /**
   * RESOLUTION: Pay 1000 LP → Card stays on field (placement handled by ActivateSpellCommand)
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: Pay 1000 LP
      createLPPaymentStep(1000, {
        id: `toon-world-lp-payment-${activatedCardInstanceId}`,
        description: "1000LPを払ってトゥーン・ワールドを発動します",
      }),

      // Note: No graveyard step - Continuous Spells stay on field after activation
    ];
  }
}
