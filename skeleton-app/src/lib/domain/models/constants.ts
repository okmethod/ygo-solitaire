/**
 * Constants - Domain constants for the game
 *
 * Centralizes all magic numbers and game-specific constants
 * Used by rules, effects, and UI components
 *
 * @module domain/models/constants
 */

import type { GamePhase } from "./Phase";
import { GAME_PHASES, PHASE_NAMES } from "./Phase";

// Re-export phase types and constants for backward compatibility
export type { GamePhase };
export { GAME_PHASES, PHASE_NAMES };

/**
 * Exodia piece card IDs
 * All 5 pieces must be in hand simultaneously to win
 */
export const EXODIA_PIECE_IDS = [
  "33396948", // Exodia the Forbidden One (head)
  "07902349", // Right Arm of the Forbidden One
  "70903634", // Left Arm of the Forbidden One
  "08124921", // Right Leg of the Forbidden One
  "44519536", // Left Leg of the Forbidden One
] as const;

/**
 * Initial life points for both players
 */
export const INITIAL_LP = 8000 as const;

/**
 * Initial hand size (number of cards drawn at game start)
 */
export const INITIAL_HAND_SIZE = 5 as const;

/**
 * Maximum hand size (soft limit for UI purposes)
 * Note: Official Yu-Gi-Oh! rules don't have a max hand size,
 * but we enforce this for practical reasons in the UI
 */
export const MAX_HAND_SIZE = 6 as const;

/**
 * Main deck size limits
 */
export const DECK_SIZE_MIN = 40 as const;
export const DECK_SIZE_MAX = 60 as const;

/**
 * Extra deck size limit
 */
export const EXTRA_DECK_SIZE_MAX = 15 as const;

/**
 * Side deck size
 */
export const SIDE_DECK_SIZE = 15 as const;

/**
 * Maximum number of copies of a single card in a deck
 * (except for unlimited cards)
 */
export const MAX_COPIES_PER_CARD = 3 as const;

/**
 * Phases where spell cards can be activated
 * (For MVP: only Main1 phase)
 */
export const SPELL_ACTIVATION_PHASES: readonly GamePhase[] = ["Main1"] as const;

/**
 * Phases where draw occurs automatically
 */
export const AUTO_DRAW_PHASES: readonly GamePhase[] = ["Draw"] as const;

/**
 * Deck recipe IDs
 */
export const DECK_RECIPE_IDS = {
  EXODIA: "exodia-draw-deck",
} as const;

/**
 * Helper to check if phase allows spell activation
 */
export function canActivateSpellInPhase(phase: GamePhase): boolean {
  return SPELL_ACTIVATION_PHASES.includes(phase);
}

/**
 * Helper to check if phase requires auto-draw
 */
export function shouldAutoDrawInPhase(phase: GamePhase): boolean {
  return AUTO_DRAW_PHASES.includes(phase);
}

/**
 * Helper to check if card ID is an Exodia piece
 */
export function isExodiaPieceId(cardId: string): boolean {
  return EXODIA_PIECE_IDS.includes(cardId as (typeof EXODIA_PIECE_IDS)[number]);
}
