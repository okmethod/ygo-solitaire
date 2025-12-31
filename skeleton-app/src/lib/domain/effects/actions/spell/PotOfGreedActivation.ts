/**
 * PotOfGreedActivation - Pot of Greed (強欲な壺) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 55144522
 * - Card Name: Pot of Greed (強欲な壺)
 * - Card Type: Normal Spell
 * - Effect: Draw 2 cards from your deck
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses step builders for draw and graveyard operations
 *
 * @module domain/effects/actions/spell/PotOfGreedActivation
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createDrawStep, createSendToGraveyardStep } from "../../builders/stepBuilders";

/**
 * PotOfGreedActivation - Pot of Greed ChainableAction
 *
 * Extends NormalSpellAction for Pot of Greed card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(55144522, new PotOfGreedActivation());
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
export class PotOfGreedActivation extends NormalSpellAction {
  protected getCardId(): string {
    return "55144522";
  }

  protected getCardName(): string {
    return "Pot of Greed";
  }

  protected getActivationDescription(): string {
    return "強欲な壺を発動します";
  }

  /**
   * Card-specific activation condition: Deck must have at least 2 cards
   */
  protected additionalActivationConditions(state: GameState): boolean {
    return state.zones.deck.length >= 2;
  }

  /**
   * RESOLUTION: Draw 2 cards, then send this card to graveyard
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      createDrawStep(2),
      createSendToGraveyardStep(activatedCardInstanceId, "Pot of Greed", "強欲な壺"),
    ];
  }
}
