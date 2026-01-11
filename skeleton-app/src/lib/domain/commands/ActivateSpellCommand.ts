/**
 * ActivateSpellCommand - Activate a spell card
 *
 * Implements the Command pattern for spell card activation.
 * Supports activation from:
 * - Hand (all spell types)
 * - spellTrapZone (set spells, with quick-play set-turn restriction)
 * - fieldZone (set field spells)
 *
 * Flow: source zone → field → effect execution → graveyard
 *
 * MVP Scope:
 * - Main1 phase only
 * - Quick-play spells cannot be activated the turn they're set
 *
 * @module application/commands/ActivateSpellCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import { moveCard, sendToGraveyard } from "$lib/domain/models/Zone";
import { canActivateSpell } from "$lib/domain/rules/SpellActivationRule";
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

    // Step 1: Determine source and target zones (T030-3)
    const sourceZone = cardInstance.location; // hand, spellTrapZone, or fieldZone

    // If card is already in a field zone (spellTrapZone/fieldZone), it's being activated from set position
    // Otherwise, it's being activated from hand
    let zonesAfterActivation = state.zones;

    if (sourceZone === "hand") {
      // Activating from hand: move to appropriate zone face-up
      const targetZone = cardInstance.spellType === "field" ? "fieldZone" : "spellTrapZone";
      zonesAfterActivation = moveCard(state.zones, this.cardInstanceId, "hand", targetZone, "faceUp");
    } else if (sourceZone === "spellTrapZone" || sourceZone === "fieldZone") {
      // Activating from set position: just flip to face-up (stay in same zone)
      zonesAfterActivation = {
        ...state.zones,
        [sourceZone]: state.zones[sourceZone].map((card) =>
          card.instanceId === this.cardInstanceId ? { ...card, position: "faceUp" as const } : card,
        ),
      };
    } else {
      return createFailureResult(state, `Cannot activate spell from ${sourceZone}`);
    }

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

    return createSuccessResult(newState, `Spell card activated (no effect): ${this.cardInstanceId}`);
  }

  /**
   * Get card instance ID being activated
   */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
