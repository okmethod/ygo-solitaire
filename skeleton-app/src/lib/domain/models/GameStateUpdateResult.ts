/**
 * GameStateUpdateResult - Result of GameState update operations
 *
 * This is a domain-level interface used by Commands, Effects, and other operations
 * that update the GameState. It does not depend on application or presentation layers.
 *
 * @module domain/models/GameStateUpdateResult
 */

import type { GameState } from "./GameState";

/**
 * Result of GameState update operations
 *
 * Used by:
 * - Commands (DrawCardCommand, ActivateSpellCommand, etc.)
 * - Effects (EffectResolutionStep)
 * - Any domain operation that updates GameState
 */
export interface GameStateUpdateResult {
  readonly success: boolean;
  readonly newState: GameState;
  readonly message?: string;
  readonly error?: string;
}

/**
 * Helper to create a successful update result
 */
export function createSuccessResult(newState: GameState, message?: string): GameStateUpdateResult {
  return {
    success: true,
    newState,
    message,
  };
}

/**
 * Helper to create a failed update result
 */
export function createFailureResult(state: GameState, error: string): GameStateUpdateResult {
  return {
    success: false,
    newState: state, // Return unchanged state on failure
    error,
  };
}
