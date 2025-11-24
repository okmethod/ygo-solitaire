/**
 * DrawCardCommand - Draw cards from deck to hand
 *
 * Implements the Command pattern for drawing cards.
 * Validates deck has sufficient cards before drawing.
 *
 * @module application/commands/DrawCardCommand
 */

import { produce } from "immer";
import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import { drawCards } from "$lib/domain/models/Zone";
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";

/**
 * Command to draw cards from deck
 */
export class DrawCardCommand implements GameCommand {
  readonly description: string;

  /**
   * Create a new DrawCardCommand
   *
   * @param count - Number of cards to draw (default: 1)
   */
  constructor(private readonly count: number = 1) {
    this.description = `Draw ${count} card${count > 1 ? "s" : ""}`;
  }

  /**
   * Check if draw is possible
   *
   * @param state - Current game state
   * @returns True if deck has enough cards
   */
  canExecute(state: GameState): boolean {
    // Check if game is already over
    if (state.result.isGameOver) {
      return false;
    }

    // Check if deck has enough cards
    return state.zones.deck.length >= this.count;
  }

  /**
   * Execute draw command
   *
   * @param state - Current game state
   * @returns Command result with new state
   */
  execute(state: GameState): CommandResult {
    if (!this.canExecute(state)) {
      return createFailureResult(
        state,
        `Cannot draw ${this.count} cards. Only ${state.zones.deck.length} cards in deck.`,
      );
    }

    // Draw cards (returns new immutable zones object)
    const newZones = drawCards(state.zones, this.count);

    // Use Immer to create new state with drawn cards
    const newState = produce(state, (draft) => {
      // Replace zones with new zones (type cast to satisfy Immer)
      draft.zones = newZones as typeof draft.zones;
    });

    // Check victory conditions after drawing
    const victoryResult = checkVictoryConditions(newState);

    // Update game result if victory/defeat occurred
    const finalState = produce(newState, (draft) => {
      draft.result = victoryResult;
    });

    return createSuccessResult(finalState, `Drew ${this.count} card${this.count > 1 ? "s" : ""}`);
  }

  /**
   * Get number of cards to draw
   */
  getCount(): number {
    return this.count;
  }
}
