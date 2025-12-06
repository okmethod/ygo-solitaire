/**
 * CommandResult - Result of command execution
 *
 * This is a domain-level interface that does not depend on application or presentation layers.
 *
 * @module domain/commands/CommandResult
 */

import type { GameState } from "../models/GameState";

/**
 * Result of command execution
 */
export interface CommandResult {
  readonly success: boolean;
  readonly newState: GameState;
  readonly message?: string;
  readonly error?: string;
}
