/**
 * AdvancePhaseCommand - Advance to next game phase
 *
 * Implements the Command pattern for phase transitions.
 * Validates phase transition rules before advancing.
 *
 * @module application/commands/AdvancePhaseCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import {
  getNextValidPhase,
  validatePhaseTransition,
  canManuallyAdvancePhase,
  getPhaseDisplayName,
} from "$lib/domain/rules/PhaseRule";

/**
 * Command to advance to next phase
 */
export class AdvancePhaseCommand implements GameCommand {
  readonly description: string;

  constructor() {
    this.description = "Advance to next phase";
  }

  /**
   * Check if phase advance is allowed
   *
   * @param state - Current game state
   * @returns True if can advance to next phase
   */
  canExecute(state: GameState): boolean {
    // Check if game is already over
    if (state.result.isGameOver) {
      return false;
    }

    const nextPhase = getNextValidPhase(state.phase);

    // Validate transition is allowed
    const validation = validatePhaseTransition(state.phase, nextPhase);
    if (!validation.valid) {
      return false;
    }

    // Check manual advance is allowed (e.g., not Draw phase with empty deck)
    const deckIsEmpty = state.zones.deck.length === 0;
    return canManuallyAdvancePhase(state.phase, deckIsEmpty);
  }

  /**
   * Execute phase advance command
   *
   * @param state - Current game state
   * @returns Command result with new state
   */
  execute(state: GameState): CommandResult {
    if (!this.canExecute(state)) {
      return createFailureResult(state, `Cannot advance from ${state.phase} phase`);
    }

    const nextPhase = getNextValidPhase(state.phase);

    // Create new state with advanced phase using spread syntax
    const newState: GameState = {
      ...state,
      phase: nextPhase,
      // Clear activatedIgnitionEffectsThisTurn when advancing to End phase
      // (Reset at end of turn for "once per turn" effects)
      activatedIgnitionEffectsThisTurn:
        nextPhase === "End" ? new Set<string>() : state.activatedIgnitionEffectsThisTurn,
      // Clear activatedOncePerTurnCards when advancing to End phase
      // (Reset at end of turn for "once per turn" card activation limit)
      activatedOncePerTurnCards: nextPhase === "End" ? new Set<number>() : state.activatedOncePerTurnCards,
      // If advancing to End phase and it's end of turn, increment turn counter
      // (In MVP, End phase loops to itself, so turn doesn't increment automatically)
      // This will be expanded in future when turn cycling is implemented
    };

    const phaseDisplayName = getPhaseDisplayName(nextPhase);

    // If advancing to End phase and there are pending end phase effects, return them for execution
    if (nextPhase === "End" && state.pendingEndPhaseEffects.length > 0) {
      // Return success with effect steps to be executed by Application Layer
      // After effects are executed, the state will be updated to clear pendingEndPhaseEffects
      return {
        success: true,
        newState: {
          ...newState,
          // Clear pending effects after returning them for execution
          pendingEndPhaseEffects: [],
        },
        message: `Advanced to ${phaseDisplayName}. Executing ${state.pendingEndPhaseEffects.length} end phase effect(s).`,
        effectSteps: [...state.pendingEndPhaseEffects],
      };
    }

    return createSuccessResult(newState, `Advanced to ${phaseDisplayName}`);
  }

  /**
   * Get the phase that would be advanced to
   *
   * @param state - Current game state
   * @returns Next phase
   */
  getNextPhase(state: GameState): string {
    return getNextValidPhase(state.phase);
  }
}
