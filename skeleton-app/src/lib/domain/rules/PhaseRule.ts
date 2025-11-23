/**
 * PhaseRule - Phase transition validation
 *
 * Validates phase transitions and determines valid actions per phase.
 * MVP scope: Draw → Standby → Main1 → End (no Battle Phase, no Main2)
 *
 * @module domain/rules/PhaseRule
 */

import type { GamePhase } from "../models/constants";
import { GAME_PHASES, getNextPhase, shouldAutoDrawInPhase } from "../models/constants";

/**
 * Validate if phase transition is allowed
 *
 * @param currentPhase - Current game phase
 * @param nextPhase - Requested next phase
 * @returns True if transition is valid
 */
export function canAdvanceToPhase(currentPhase: GamePhase, nextPhase: GamePhase): boolean {
  const expectedNext = getNextPhase(currentPhase);
  return nextPhase === expectedNext;
}

/**
 * Get the next valid phase
 *
 * @param currentPhase - Current game phase
 * @returns Next phase in sequence
 */
export function getNextValidPhase(currentPhase: GamePhase): GamePhase {
  return getNextPhase(currentPhase);
}

/**
 * Check if automatic draw should occur in this phase
 *
 * @param phase - Game phase to check
 * @returns True if Draw phase (auto-draw required)
 */
export function requiresAutoDraw(phase: GamePhase): boolean {
  return shouldAutoDrawInPhase(phase);
}

/**
 * Check if spell cards can be activated in this phase
 *
 * @param phase - Game phase to check
 * @returns True if Main1 phase (spell activation allowed)
 */
export function canActivateSpellsInPhase(phase: GamePhase): boolean {
  return phase === "Main1";
}

/**
 * Check if player can manually advance to next phase
 *
 * @param phase - Current game phase
 * @param deckIsEmpty - Whether deck has cards remaining
 * @returns True if phase advance is allowed
 */
export function canManuallyAdvancePhase(phase: GamePhase, deckIsEmpty: boolean): boolean {
  // Cannot advance from Draw phase if deck is empty (deck out)
  if (phase === "Draw" && deckIsEmpty) {
    return false;
  }

  // Can advance from all other phases
  return true;
}

/**
 * Check if this is the first turn
 *
 * @param turn - Current turn number
 * @returns True if turn 1
 */
export function isFirstTurn(turn: number): boolean {
  return turn === 1;
}

/**
 * Check if draw phase should skip auto-draw on first turn
 * (In official rules, first turn player doesn't draw in Draw Phase)
 *
 * @param turn - Current turn number
 * @param phase - Current game phase
 * @returns True if first turn Draw phase (should skip auto-draw)
 */
export function shouldSkipFirstTurnDraw(turn: number, phase: GamePhase): boolean {
  return isFirstTurn(turn) && phase === "Draw";
}

/**
 * Get phase display name (Japanese)
 *
 * @param phase - Game phase
 * @returns Japanese phase name
 */
export function getPhaseDisplayName(phase: GamePhase): string {
  const phaseNames: Record<GamePhase, string> = {
    Draw: "ドローフェイズ",
    Standby: "スタンバイフェイズ",
    Main1: "メインフェイズ",
    End: "エンドフェイズ",
  };
  return phaseNames[phase];
}

/**
 * Get all valid phases in order
 *
 * @returns Array of all game phases
 */
export function getAllPhases(): readonly GamePhase[] {
  return GAME_PHASES;
}

/**
 * Check if phase is the last phase of the turn
 *
 * @param phase - Game phase to check
 * @returns True if End phase
 */
export function isEndPhase(phase: GamePhase): boolean {
  return phase === "End";
}

/**
 * Validate phase transition with detailed error message
 *
 * @param currentPhase - Current game phase
 * @param nextPhase - Requested next phase
 * @returns Object with valid flag and error message if invalid
 */
export function validatePhaseTransition(
  currentPhase: GamePhase,
  nextPhase: GamePhase,
): { valid: boolean; error?: string } {
  const expectedNext = getNextPhase(currentPhase);

  if (nextPhase !== expectedNext) {
    return {
      valid: false,
      error: `Invalid phase transition: ${currentPhase} → ${nextPhase}. Expected: ${expectedNext}`,
    };
  }

  return { valid: true };
}
