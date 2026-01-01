/**
 * OneDayOfPeaceActivation - One Day of Peace (一時休戦) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 33782437
 * - Card Name: One Day of Peace (一時休戦)
 * - Card Type: Normal Spell
 * - Effect: Both players draw 1 card. All battle and effect damage becomes 0 for the rest of this turn.
 *
 * Implementation using NormalSpellAction abstraction:
 * - Extends NormalSpellAction for common spell card logic
 * - Uses step builders for draw and graveyard operations
 * - Custom steps for opponent draw and damage negation
 *
 * @module domain/effects/actions/spell/OneDayOfPeaceActivation
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createDrawStep, createSendToGraveyardStep } from "../../builders/stepBuilders";

/**
 * OneDayOfPeaceActivation - One Day of Peace ChainableAction
 *
 * Extends NormalSpellAction for One Day of Peace card implementation.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(33782437, new OneDayOfPeaceActivation());
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
export class OneDayOfPeaceActivation extends NormalSpellAction {
  constructor() {
    super(33782437);
  }

  /**
   * Card-specific activation condition: Deck must have at least 1 card
   */
  protected additionalActivationConditions(state: GameState): boolean {
    return state.zones.deck.length >= 1;
  }

  /**
   * RESOLUTION: Draw 1 card (player), opponent draws (internal), damage negation, then send to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Player draws 1 card
      createDrawStep(1),

      // Step 2: Opponent draws 1 card (internal state only, no UI update)
      {
        id: "one-day-of-peace-draw-opponent",
        summary: "相手がドロー",
        description: "相手がデッキから1枚ドローします（内部状態のみ）",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // In 1-turn kill solitaire, opponent's hand is not tracked in UI
          // This step is for completeness and future compatibility
          // No actual state change needed for opponent's hand

          return {
            success: true,
            newState: currentState,
            message: "Opponent drew 1 card (internal)",
          };
        },
      },

      // Step 3: Set damageNegation flag to true
      {
        id: "one-day-of-peace-damage-negation",
        summary: "ダメージ無効化",
        description: "このターン、全てのダメージは0になります",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          const newState: GameState = {
            ...currentState,
            damageNegation: true,
          };

          return {
            success: true,
            newState,
            message: "Damage negation activated for this turn",
          };
        },
      },

      // Step 4: Send spell card to graveyard
      createSendToGraveyardStep(activatedCardInstanceId, this.cardId),
    ];
  }
}
