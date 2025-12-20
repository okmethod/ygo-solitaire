/**
 * ShuffleDeckCommand - Shuffle the deck using Fisher-Yates algorithm
 *
 * Implements the Command pattern for deck shuffling.
 * Uses the Fisher-Yates algorithm to randomize card order.
 *
 * @module application/commands/ShuffleDeckCommand
 */

import { produce } from 'immer';
import type { GameState } from '$lib/domain/models/GameState';
import type { GameCommand, CommandResult } from './GameCommand';
import { createSuccessResult, createFailureResult } from './GameCommand';
import { shuffleArray } from '$lib/shared/utils/arrayUtils';

/**
 * Command to shuffle the deck
 *
 * This command randomizes the order of cards in the deck zone
 * using the Fisher-Yates (Knuth) shuffle algorithm.
 */
export class ShuffleDeckCommand implements GameCommand {
	readonly description = 'Shuffle deck';

	/**
	 * Check if shuffle is possible
	 *
	 * @param state - Current game state
	 * @returns True if game is not over (shuffle is always valid otherwise)
	 */
	canExecute(state: GameState): boolean {
		// Cannot shuffle if game is already over
		if (state.result.isGameOver) {
			return false;
		}

		// Shuffling is always allowed during an active game
		// (even if deck is empty, shuffling empty array is safe)
		return true;
	}

	/**
	 * Execute shuffle command
	 *
	 * @param state - Current game state
	 * @returns Command result with new state containing shuffled deck
	 */
	execute(state: GameState): CommandResult {
		if (!this.canExecute(state)) {
			return createFailureResult(state, 'Cannot shuffle deck: game is already over');
		}

		try {
			// Shuffle deck using Fisher-Yates algorithm
			const newState = produce(state, (draft) => {
				draft.zones.deck = shuffleArray(state.zones.deck);
			});

			return createSuccessResult(newState, 'デッキをシャッフルしました');
		} catch (error) {
			return createFailureResult(
				state,
				`デッキのシャッフルに失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
}
