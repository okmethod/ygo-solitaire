/**
 * GameCommand - Command pattern base interface
 *
 * Encapsulates player actions as objects, enabling:
 * - Undo/Redo functionality (future)
 * - Action history/replay (future)
 * - Testable game logic
 * - Clear separation of concerns
 *
 * @module application/commands/GameCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
export { createSuccessResult, createFailureResult } from "$lib/domain/models/GameStateUpdate";

// Re-export as CommandResult for convenience in Command context
export type { GameStateUpdateResult as CommandResult };

/**
 * Base interface for all game commands
 *
 * Commands follow the Command Pattern:
 * 1. canExecute() - Pre-validation (checks rules without mutating state)
 * 2. execute() - Returns new GameState (immutability via spread syntax)
 * 3. description - Human-readable action name (for logs/history)
 *
 * TODO: 要検討 - インターフェースは、modelに置いて良いのでは？？
 */
export interface GameCommand {
  /**
   * Description of this command (for logging/history)
   * Example: "Draw 2 cards", "Advance to Main Phase"
   */
  readonly description: string;

  /**
   * Check if command can be executed without mutating state
   *
   * @param state - Current game state
   * @returns True if command can execute, false otherwise
   */
  canExecute(state: GameState): boolean;

  /**
   * Execute the command and return new game state
   *
   * @param state - Current game state
   * @returns Command result with new state
   * @throws Error if canExecute() returns false
   */
  execute(state: GameState): GameStateUpdateResult;
}
