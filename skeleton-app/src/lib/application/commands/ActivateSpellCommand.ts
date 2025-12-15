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

import { produce } from "immer";
import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import { moveCard, sendToGraveyard } from "$lib/domain/models/Zone";
import { canActivateSpell } from "$lib/domain/rules/SpellActivationRule";
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";
import { CardEffectRegistry } from "$lib/application/effects";
import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";

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
      const cardId = parseInt(cardInstance.cardId, 10);
      const effect = CardEffectRegistry.get(cardId);

      if (effect && !effect.canActivate(state)) {
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
   * @returns Command result with new state
   */
  execute(state: GameState): CommandResult {
    // Validate activation
    const validation = canActivateSpell(state, this.cardInstanceId);
    if (!validation.canActivate) {
      return createFailureResult(state, validation.reason || "Cannot activate spell card");
    }

    // Step 1: Move card from hand to field (activation)
    const zonesAfterActivation = moveCard(state.zones, this.cardInstanceId, "hand", "field", "faceUp");

    // Step 2: Effect execution based on card ID
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card instance ${this.cardInstanceId} not found`);
    }

    // Create intermediate state for effect resolution
    const stateAfterActivation = produce(state, (draft) => {
      draft.zones = zonesAfterActivation as typeof draft.zones;
    });

    // Check if card has registered effect
    const cardId = parseInt(cardInstance.cardId, 10);
    const effect = CardEffectRegistry.get(cardId);

    if (effect && effect.canActivate(stateAfterActivation)) {
      // Card has effect - trigger effect resolution
      // Pass cardInstanceId to effect for graveyard-sending step
      const steps = effect.createSteps(stateAfterActivation, this.cardInstanceId);
      effectResolutionStore.startResolution(steps);

      // Early return - effect resolution will handle graveyard-sending
      return createSuccessResult(stateAfterActivation, `Spell card activated: ${this.cardInstanceId}`);
    }

    // No effect registered - send directly to graveyard
    const zonesAfterResolution = sendToGraveyard(zonesAfterActivation, this.cardInstanceId);

    // Create new state with updated zones
    const newState = produce(state, (draft) => {
      draft.zones = zonesAfterResolution as typeof draft.zones;
    });

    // Check victory conditions after activation
    const victoryResult = checkVictoryConditions(newState);

    // Update game result if victory/defeat occurred
    const finalState = produce(newState, (draft) => {
      draft.result = victoryResult;
    });

    return createSuccessResult(finalState, `Spell card activated (no effect): ${this.cardInstanceId}`);
  }

  /**
   * Get card instance ID being activated
   */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
