/**
 * ToonWorldActivation - Toon World (トゥーン・ワールド) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 15259703
 * - Card Name: Toon World (トゥーン・ワールド)
 * - Card Type: Continuous Spell (implemented as Field Spell behavior)
 * - Effect: Pay 1000 LP to activate this card.
 *
 * Implementation using FieldSpellAction abstraction:
 * - Extends FieldSpellAction for field spell behavior
 * - Uses createLPPaymentStep for LP cost payment
 * - Card stays on field after activation (no graveyard step)
 *
 * Note: Although the actual card type is "continuous", it behaves like a field spell
 * (stays on field, provides passive effects). We use FieldSpellAction for implementation.
 *
 * @module domain/effects/actions/spell/ToonWorldActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { FieldSpellAction } from "../../base/spell/FieldSpellAction";
import { createLPPaymentStep } from "../../builders/stepBuilders";

/**
 * ToonWorldActivation - Toon World ChainableAction
 *
 * Extends FieldSpellAction for Toon World card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(15259703, new ToonWorldActivation());
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
export class ToonWorldActivation extends FieldSpellAction {
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
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Pay 1000 LP
      createLPPaymentStep(1000, {
        id: `toon-world-lp-payment-${activatedCardInstanceId}`,
        description: "1000LPを払ってトゥーン・ワールドを発動します",
      }),

      // Note: No graveyard step - Field Spells stay on field after activation
    ];
  }
}
