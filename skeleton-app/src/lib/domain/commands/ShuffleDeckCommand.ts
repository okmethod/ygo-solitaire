/**
 * ShuffleDeckCommand - Shuffle the deck using Fisher-Yates algorithm
 *
 * Implements the Command pattern for deck shuffling.
 * Uses the Fisher-Yates algorithm to randomize card order.
 *
 * @module application/commands/ShuffleDeckCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import { shuffleArray } from "$lib/shared/utils/arrayUtils";

/**
 * Command to shuffle the deck
 *
 * This command randomizes the order of cards in the deck zone
 * using the Fisher-Yates (Knuth) shuffle algorithm.
 */
export class ShuffleDeckCommand implements GameCommand {
  readonly description = "Shuffle deck";

  /**
   * Check if shuffle is possible
   *
   * @returns Always true (shuffling is a safe operation even on empty decks or during game over)
   */
  canExecute(): boolean {
    // Shuffling is always allowed
    // - Safe operation even if deck is empty (shuffling empty array is no-op)
    // - Can be used to reset deck state even if game is over
    return true;
  }

  /**
   * Execute shuffle command
   *
   * @param state - Current game state
   * @returns Command result with new state containing shuffled deck
   */
  execute(state: GameState): CommandResult {
    try {
      // Shuffle deck using Fisher-Yates algorithm
      const shuffledDeck = shuffleArray(state.zones.deck);

      // Create new state with shuffled deck using spread syntax
      const newState: GameState = {
        ...state,
        zones: {
          ...state.zones,
          deck: shuffledDeck,
        },
      };

      return createSuccessResult(newState, "デッキをシャッフルしました");
    } catch (error) {
      return createFailureResult(
        state,
        `デッキのシャッフルに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
