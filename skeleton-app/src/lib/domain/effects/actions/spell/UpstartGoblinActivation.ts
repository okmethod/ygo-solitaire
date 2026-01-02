/**
 * UpstartGoblinActivation - Upstart Goblin (成金ゴブリン) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 70368879
 * - Card Name: Upstart Goblin (成金ゴブリン)
 * - Card Type: Normal Spell
 * - Effect: Draw 1 card from your deck. Your opponent gains 1000 LP.
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses step builders for draw, life gain, and graveyard operations
 *
 * @module domain/effects/actions/spell/UpstartGoblinActivation
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createDrawStep, createGainLifeStep, createSendToGraveyardStep } from "../../builders/stepBuilders";

/**
 * UpstartGoblinActivation - Upstart Goblin ChainableAction
 *
 * Extends NormalSpellAction for Upstart Goblin card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(70368879, new UpstartGoblinActivation());
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
export class UpstartGoblinActivation extends NormalSpellAction {
  constructor() {
    super(70368879);
  }

  /**
   * Card-specific activation condition: Deck must have at least 1 card
   */
  protected additionalActivationConditions(state: GameState): boolean {
    return state.zones.deck.length >= 1;
  }

  /**
   * RESOLUTION: Draw 1 card, opponent gains 1000 LP, then send to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      createDrawStep(1),
      createGainLifeStep(1000, { target: "opponent" }),
      createSendToGraveyardStep(activatedCardInstanceId, this.cardId),
    ];
  }
}
