/**
 * GameStateInvariants - Validation functions for GameState
 *
 * Ensures GameState maintains valid invariants (unchanging truths).
 * These validations catch bugs early and prevent invalid game states.
 *
 * @module domain/models/GameStateInvariants
 */

import type { GameState } from "./GameState";
import type { GamePhase } from "./Phase";

/**
 * Validation result type
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

/**
 * Helper to create validation result
 */
function createValidationResult(errors: string[] = []): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate entire GameState
 *
 * Checks all invariants and returns aggregated errors.
 *
 * @param state - GameState to validate
 * @returns Validation result with all errors
 *
 * @example
 * ```typescript
 * const result = validateGameState(state);
 * if (!result.isValid) {
 *   console.error('Invalid state:', result.errors);
 * }
 * ```
 */
export function validateGameState(state: GameState): ValidationResult {
  const errors: string[] = [];

  // Aggregate all validation errors
  errors.push(...validateZones(state).errors);
  errors.push(...validateLifePoints(state).errors);
  errors.push(...validatePhase(state).errors);
  errors.push(...validateTurn(state).errors);
  errors.push(...validateResult(state).errors);

  return createValidationResult(errors);
}

/**
 * Validate zones (deck, hand, field, graveyard, banished)
 *
 * Checks:
 * - No duplicate card instances
 * - All instances have valid IDs
 * - Deck size is reasonable (0-60 cards)
 * - Hand size is reasonable (0-10 cards)
 * - Field size doesn't exceed limits
 *
 * @param state - GameState to validate
 * @returns Validation result
 */
export function validateZones(state: GameState): ValidationResult {
  const errors: string[] = [];

  // Check deck size
  if (state.zones.deck.length > 60) {
    errors.push(`Deck has too many cards: ${state.zones.deck.length} (max: 60)`);
  }

  // Check hand size
  if (state.zones.hand.length > 10) {
    errors.push(`Hand has too many cards: ${state.zones.hand.length} (max: 10)`);
  }

  // Check field size (max 5 cards)
  if (state.zones.field.length > 5) {
    errors.push(`Field has too many cards: ${state.zones.field.length} (max: 5)`);
  }

  // Check for duplicate instance IDs across all zones
  const allInstances = [
    ...state.zones.deck,
    ...state.zones.hand,
    ...state.zones.field,
    ...state.zones.graveyard,
    ...state.zones.banished,
  ];

  const instanceIds = allInstances.map((card) => card.instanceId);
  const duplicates = instanceIds.filter((id, index) => instanceIds.indexOf(id) !== index);

  if (duplicates.length > 0) {
    errors.push(`Duplicate card instance IDs found: ${duplicates.join(", ")}`);
  }

  // Check all instances have valid IDs
  const invalidInstances = allInstances.filter((card) => !card.instanceId || !card.id);
  if (invalidInstances.length > 0) {
    errors.push(`Found ${invalidInstances.length} card instances with missing IDs`);
  }

  // Check location matches actual zone
  const deckInvalid = state.zones.deck.filter((card) => card.location !== "deck");
  const handInvalid = state.zones.hand.filter((card) => card.location !== "hand");
  const fieldInvalid = state.zones.field.filter((card) => card.location !== "field");
  const graveyardInvalid = state.zones.graveyard.filter((card) => card.location !== "graveyard");
  const banishedInvalid = state.zones.banished.filter((card) => card.location !== "banished");

  if (deckInvalid.length > 0) {
    errors.push(`${deckInvalid.length} cards in deck have incorrect location property`);
  }
  if (handInvalid.length > 0) {
    errors.push(`${handInvalid.length} cards in hand have incorrect location property`);
  }
  if (fieldInvalid.length > 0) {
    errors.push(`${fieldInvalid.length} cards in field have incorrect location property`);
  }
  if (graveyardInvalid.length > 0) {
    errors.push(`${graveyardInvalid.length} cards in graveyard have incorrect location property`);
  }
  if (banishedInvalid.length > 0) {
    errors.push(`${banishedInvalid.length} cards in banished have incorrect location property`);
  }

  return createValidationResult(errors);
}

/**
 * Validate life points
 *
 * Checks:
 * - LP are non-negative
 * - LP are within reasonable range (0-99999)
 *
 * @param state - GameState to validate
 * @returns Validation result
 */
export function validateLifePoints(state: GameState): ValidationResult {
  const errors: string[] = [];

  // Check player LP
  if (state.lp.player < 0) {
    errors.push(`Player LP is negative: ${state.lp.player}`);
  }
  if (state.lp.player > 99999) {
    errors.push(`Player LP exceeds maximum: ${state.lp.player} (max: 99999)`);
  }

  // Check opponent LP
  if (state.lp.opponent < 0) {
    errors.push(`Opponent LP is negative: ${state.lp.opponent}`);
  }
  if (state.lp.opponent > 99999) {
    errors.push(`Opponent LP exceeds maximum: ${state.lp.opponent} (max: 99999)`);
  }

  return createValidationResult(errors);
}

/**
 * Validate phase
 *
 * Checks:
 * - Phase is one of the valid phases
 * - Phase matches the turn progression
 *
 * @param state - GameState to validate
 * @returns Validation result
 */
export function validatePhase(state: GameState): ValidationResult {
  const errors: string[] = [];

  const validPhases: GamePhase[] = ["Draw", "Standby", "Main1", "End"];

  if (!validPhases.includes(state.phase)) {
    errors.push(`Invalid phase: ${state.phase}. Must be one of: ${validPhases.join(", ")}`);
  }

  return createValidationResult(errors);
}

/**
 * Validate turn number
 *
 * Checks:
 * - Turn is positive integer
 * - Turn is reasonable (1-999)
 *
 * @param state - GameState to validate
 * @returns Validation result
 */
export function validateTurn(state: GameState): ValidationResult {
  const errors: string[] = [];

  if (state.turn < 1) {
    errors.push(`Turn must be at least 1: ${state.turn}`);
  }

  if (state.turn > 999) {
    errors.push(`Turn exceeds maximum: ${state.turn} (max: 999)`);
  }

  if (!Number.isInteger(state.turn)) {
    errors.push(`Turn must be an integer: ${state.turn}`);
  }

  return createValidationResult(errors);
}

/**
 * Validate game result
 *
 * Checks:
 * - If game is over, winner and reason must be set
 * - If game is ongoing, winner and reason must not be set
 *
 * @param state - GameState to validate
 * @returns Validation result
 */
export function validateResult(state: GameState): ValidationResult {
  const errors: string[] = [];

  if (state.result.isGameOver) {
    // Game over - must have winner and reason
    if (!state.result.winner) {
      errors.push("Game is over but winner is not set");
    }

    if (!state.result.reason) {
      errors.push("Game is over but reason is not set");
    }

    // Winner must be valid
    if (state.result.winner && !["player", "opponent"].includes(state.result.winner)) {
      errors.push(`Invalid winner: ${state.result.winner}. Must be "player" or "opponent"`);
    }

    // Reason must be valid
    if (state.result.reason && !["exodia", "lp0", "deckout"].includes(state.result.reason)) {
      errors.push(`Invalid reason: ${state.result.reason}. Must be "exodia", "lp0", or "deckout"`);
    }
  } else {
    // Game ongoing - must not have winner or reason
    if (state.result.winner) {
      errors.push("Game is ongoing but winner is set");
    }

    if (state.result.reason) {
      errors.push("Game is ongoing but reason is set");
    }
  }

  return createValidationResult(errors);
}

/**
 * Check if GameState has any validation errors
 *
 * Quick boolean check without returning detailed errors.
 *
 * @param state - GameState to check
 * @returns True if valid, false if errors exist
 */
export function isValidGameState(state: GameState): boolean {
  return validateGameState(state).isValid;
}

/**
 * Assert GameState is valid
 *
 * Throws error if validation fails. Useful for debugging.
 *
 * @param state - GameState to validate
 * @throws Error if validation fails
 */
export function assertValidGameState(state: GameState): void {
  const result = validateGameState(state);
  if (!result.isValid) {
    throw new Error(`Invalid GameState:\n${result.errors.join("\n")}`);
  }
}
