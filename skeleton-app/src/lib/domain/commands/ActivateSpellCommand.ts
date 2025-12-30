/**
 * ActivateSpellCommand - Activate a spell card from hand
 *
 * Implements the Command pattern for spell card activation.
 * Moves card: hand → field → effect execution → graveyard
 *
 * MVP Scope:
 * - Normal spell cards only
 * - Main1 phase only
 * - No effect execution (placeholder for now)
 *
 * @module application/commands/ActivateSpellCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import { moveCard, sendToGraveyard } from "$lib/domain/models/Zone";
import { canActivateSpell } from "$lib/domain/rules/SpellActivationRule";
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";

/**
 * Command to activate a spell card
 */
export class ActivateSpellCommand implements GameCommand {
  readonly description: string;

  /**
   * Create a new ActivateSpellCommand
   *
   * @param cardInstanceId - Card instance ID to activate
   */
  constructor(private readonly cardInstanceId: string) {
    this.description = `Activate spell card ${cardInstanceId}`;
  }

  /**
   * Check if activation is possible
   *
   * @param state - Current game state
   * @returns True if spell can be activated
   */
  canExecute(state: GameState): boolean {
    // Check if game is already over
    if (state.result.isGameOver) {
      return false;
    }

    // Check spell activation rules
    const validation = canActivateSpell(state, this.cardInstanceId);
    if (!validation.canActivate) {
      return false;
    }

    // Check card-specific effect requirements (if registered)
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (cardInstance) {
      const cardId = cardInstance.id; // CardInstance extends CardData
      const chainableAction = ChainableActionRegistry.get(cardId);

      if (chainableAction && !chainableAction.canActivate(state)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute spell activation command
   *
   * Flow: hand → field → [effect execution] → graveyard
   *
   * @param state - Current game state
   * @returns Command result with new state (effectSteps included if effect exists)
   */
  execute(state: GameState): CommandResult {
    // Validate activation
    const validation = canActivateSpell(state, this.cardInstanceId);
    if (!validation.canActivate) {
      return createFailureResult(state, validation.reason || "Cannot activate spell card");
    }

    // Step 2: Effect execution based on card ID
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card instance ${this.cardInstanceId} not found`);
    }

    const cardId = cardInstance.id; // CardInstance extends CardData

    // Check card-specific activation conditions (before moving to field)
    const chainableAction = ChainableActionRegistry.get(cardId);
    if (chainableAction && !chainableAction.canActivate(state)) {
      return createFailureResult(state, "発動条件を満たしていません");
    }

    // Step 1: Move card from hand to field (activation)
    const zonesAfterActivation = moveCard(state.zones, this.cardInstanceId, "hand", "field", "faceUp");

    // Create intermediate state for effect resolution using spread syntax
    const stateAfterActivation: GameState = {
      ...state,
      zones: zonesAfterActivation,
    };

    // Check ChainableActionRegistry for card effect
    if (chainableAction && chainableAction.canActivate(stateAfterActivation)) {
      // Get activation and resolution steps
      const activationSteps = chainableAction.createActivationSteps(stateAfterActivation);
      const resolutionSteps = chainableAction.createResolutionSteps(stateAfterActivation, this.cardInstanceId);

      // Combine activation and resolution steps into a single sequence
      const allEffectSteps = [...activationSteps, ...resolutionSteps];

      // Return result with all effect steps (delegate to Application Layer)
      // Application Layer will execute all steps sequentially with proper notifications
      return {
        success: true,
        newState: stateAfterActivation,
        message: `Spell card activated: ${this.cardInstanceId}`,
        effectSteps: allEffectSteps,
      };
    }

    // No effect registered - send directly to graveyard
    const zonesAfterResolution = sendToGraveyard(zonesAfterActivation, this.cardInstanceId);

    // Create new state with updated zones using spread syntax
    const newState: GameState = {
      ...state,
      zones: zonesAfterResolution,
    };

    // Check victory conditions after activation
    const victoryResult = checkVictoryConditions(newState);

    // Update game result if victory/defeat occurred using spread syntax
    const finalState: GameState = {
      ...newState,
      result: victoryResult,
    };

    return createSuccessResult(finalState, `Spell card activated (no effect): ${this.cardInstanceId}`);
  }

  /**
   * Get card instance ID being activated
   */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
