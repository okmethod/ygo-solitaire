/**
 * ActivateIgnitionEffectCommand - Activate an ignition effect
 *
 * Implements the Command pattern for ignition effect activation.
 * Ignition effects are effects of cards already face-up on the field.
 *
 * Flow: [card on field] → [activate ignition effect] → [effect execution]
 *
 * MVP Scope:
 * - Main1 phase only
 * - Currently only Chicken Game (67616300) has ignition effect (hardcoded)
 *
 * TODO: Refactor to use registry pattern when multiple ignition effects are needed
 * See: ChainableActionRegistry extension design for supporting multiple actions per card
 *
 * @module domain/commands/ActivateIgnitionEffectCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "$lib/domain/models/GameStateUpdate";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/spell/ChickenGameIgnitionEffect";

/**
 * Command to activate an ignition effect
 */
export class ActivateIgnitionEffectCommand implements GameCommand {
  readonly description: string;

  /**
   * Create a new ActivateIgnitionEffectCommand
   *
   * @param cardInstanceId - Card instance ID to activate ignition effect from
   */
  constructor(private readonly cardInstanceId: string) {
    this.description = `Activate ignition effect of ${cardInstanceId}`;
  }

  /**
   * Check if ignition effect can be activated
   *
   * Requirements:
   * - Game is not over
   * - Card exists and is face-up on field
   * - Card has an ignition effect (currently only Chicken Game)
   * - Card-specific activation conditions are met
   *
   * @param state - Current game state
   * @returns True if ignition effect can be activated
   */
  canExecute(state: GameState): boolean {
    // 1. Check if game is over
    if (state.result.isGameOver) {
      return false;
    }

    // 2. Find card instance
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return false;
    }

    // 3. Check card is face-up on field (fieldZone, spellTrapZone, or mainMonsterZone)
    const validLocations = ["fieldZone", "spellTrapZone", "mainMonsterZone"];
    if (!validLocations.includes(cardInstance.location)) {
      return false;
    }
    if (cardInstance.position !== "faceUp") {
      return false;
    }

    // 4. Hardcoded check for Chicken Game (TODO: use registry)
    const cardId = cardInstance.id;
    if (cardId !== 67616300) {
      return false; // Only Chicken Game has ignition effect for now
    }

    // 5. Check card-specific activation conditions
    const ignitionEffect = new ChickenGameIgnitionEffect(this.cardInstanceId);
    if (!ignitionEffect.canActivate(state)) {
      return false;
    }

    return true;
  }

  /**
   * Execute ignition effect activation
   *
   * Flow:
   * 1. Validate activation conditions
   * 2. Execute activation steps (cost payment, once-per-turn recording)
   * 3. Return result with resolution steps
   *
   * @param state - Current game state
   * @returns Command result with new state and effect steps
   */
  execute(state: GameState): CommandResult {
    // Validate
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card instance ${this.cardInstanceId} not found`);
    }

    // Hardcoded check for Chicken Game (TODO: use registry)
    const cardId = cardInstance.id;
    if (cardId !== 67616300) {
      return createFailureResult(state, "This card has no ignition effect");
    }

    // Instantiate Chicken Game ignition effect
    const ignitionEffect = new ChickenGameIgnitionEffect(this.cardInstanceId);

    if (!ignitionEffect.canActivate(state)) {
      return createFailureResult(state, "発動条件を満たしていません");
    }

    // Get activation and resolution steps
    const activationSteps = ignitionEffect.createActivationSteps(state);
    const resolutionSteps = ignitionEffect.createResolutionSteps(state, this.cardInstanceId);

    // Combine activation and resolution steps into a single sequence
    const allEffectSteps = [...activationSteps, ...resolutionSteps];

    // Return result with all effect steps (delegate to Application Layer)
    // Application Layer will execute all steps sequentially with proper notifications
    return {
      success: true,
      newState: state,
      message: `Ignition effect activated: ${this.cardInstanceId}`,
      effectSteps: allEffectSteps,
    };
  }

  /**
   * Get card instance ID being activated
   */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
