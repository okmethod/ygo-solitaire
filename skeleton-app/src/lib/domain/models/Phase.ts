/**
 * Phase - Game phase type definitions
 *
 * Defines the game phases for Yu-Gi-Oh! turn structure.
 * MVP scope: Draw, Standby, Main1, End only
 * (Battle Phase and Main2 are excluded for first-turn-kill decks)
 *
 * @module domain/models/Phase
 */

/**
 * Game phase type
 * MVP scope: Draw, Standby, Main1, End only
 * (Battle Phase and Main2 are excluded for Exodia Draw Deck)
 */
export type GamePhase = "Draw" | "Standby" | "Main1" | "End";

/**
 * All game phases in order
 */
const GAME_PHASES: readonly GamePhase[] = ["Draw", "Standby", "Main1", "End"] as const;

/**
 * Phase display names (Japanese)
 */
export const PHASE_NAMES: Record<GamePhase, string> = {
  Draw: "ドローフェイズ",
  Standby: "スタンバイフェイズ",
  Main1: "メインフェイズ",
  End: "エンドフェイズ",
} as const;

/**
 * Helper to get next phase
 *
 * @param currentPhase - Current game phase
 * @returns Next phase in sequence, or "End" if at end of turn
 */
export function getNextPhase(currentPhase: GamePhase): GamePhase {
  const currentIndex = GAME_PHASES.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === GAME_PHASES.length - 1) {
    return "End";
  }
  return GAME_PHASES[currentIndex + 1];
}
