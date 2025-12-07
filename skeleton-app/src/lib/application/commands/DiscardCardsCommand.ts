/**
 * DiscardCardsCommand - Discard multiple cards from hand to graveyard
 *
 * Implements the Command pattern for discarding cards.
 * Validates all cards are in hand before discarding.
 *
 * @module application/commands/DiscardCardsCommand
 */

import { produce } from "immer";
import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import { discardCards } from "$lib/domain/models/Zone";

/**
 * Command to discard multiple cards from hand to graveyard
 */
export class DiscardCardsCommand implements GameCommand {
  readonly description: string;

  /**
   * Create a new DiscardCardsCommand
   *
   * @param instanceIds - Array of card instance IDs to discard
   */
  constructor(private readonly instanceIds: string[]) {
    this.description = `Discard ${instanceIds.length} card${instanceIds.length > 1 ? "s" : ""}`;
  }

  /**
   * Check if discard is possible
   *
   * @param state - Current game state
   * @returns True if all cards are in hand
   */
  canExecute(state: GameState): boolean {
    // Check if game is already over
    if (state.result.isGameOver) {
      return false;
    }

    // Check if all cards are in hand
    for (const instanceId of this.instanceIds) {
      const cardInHand = state.zones.hand.find((c) => c.instanceId === instanceId);
      if (!cardInHand) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute discard command
   *
   * @param state - Current game state
   * @returns Command result with new state
   */
  execute(state: GameState): CommandResult {
    if (!this.canExecute(state)) {
      return createFailureResult(state, `Cannot discard ${this.instanceIds.length} cards. Some cards are not in hand.`);
    }

    // Discard cards (returns new immutable zones object)
    const newZones = discardCards(state.zones, this.instanceIds);

    // Use Immer to create new state with discarded cards
    const newState = produce(state, (draft) => {
      // Replace zones with new zones (type cast to satisfy Immer)
      draft.zones = newZones as typeof draft.zones;
    });

    return createSuccessResult(
      newState,
      `Discarded ${this.instanceIds.length} card${this.instanceIds.length > 1 ? "s" : ""}`,
    );
  }

  /**
   * Get card instance IDs to discard
   */
  getInstanceIds(): string[] {
    return [...this.instanceIds];
  }
}
