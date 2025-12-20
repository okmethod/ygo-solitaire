/**
 * Unit tests for ShuffleDeckCommand
 *
 * テストケース:
 * 1. シャッフルが成功すること（successful shuffle）
 * 2. 元の状態が変更されないこと（state immutability）
 */

import { describe, it, expect } from 'vitest';
import { ShuffleDeckCommand } from '$lib/application/commands/ShuffleDeckCommand';
import {
	createExodiaDeckState,
	createMockGameState,
	createCardInstances
} from '../../../__testUtils__/gameStateFactory';

describe('ShuffleDeckCommand', () => {
	describe('canExecute', () => {
		it('should return true when game is active', () => {
			const state = createExodiaDeckState();
			const command = new ShuffleDeckCommand();

			expect(command.canExecute(state)).toBe(true);
		});

		it('should return true even when deck is empty', () => {
			const state = createMockGameState({
				zones: {
					deck: [],
					hand: [],
					field: [],
					graveyard: [],
					banished: []
				}
			});
			const command = new ShuffleDeckCommand();

			// Shuffling empty deck is safe (returns empty array)
			expect(command.canExecute(state)).toBe(true);
		});

		it('should return false when game is over', () => {
			const state = createMockGameState({
				result: {
					isGameOver: true,
					victory: true,
					victoryReason: 'Exodia'
				}
			});
			const command = new ShuffleDeckCommand();

			expect(command.canExecute(state)).toBe(false);
		});
	});

	describe('execute', () => {
		it('should successfully shuffle the deck', () => {
			const state = createExodiaDeckState();
			const originalDeckLength = state.zones.deck.length;
			const command = new ShuffleDeckCommand();

			const result = command.execute(state);

			expect(result.success).toBe(true);
			expect(result.newState).toBeDefined();
			expect(result.newState.zones.deck.length).toBe(originalDeckLength);
			expect(result.message).toBe('デッキをシャッフルしました');
		});

		it('should preserve all card IDs after shuffling', () => {
			const state = createExodiaDeckState();
			const originalCardIds = state.zones.deck.map((card) => card.cardId).sort();
			const command = new ShuffleDeckCommand();

			const result = command.execute(state);

			const shuffledCardIds = result.newState.zones.deck.map((card) => card.cardId).sort();
			expect(shuffledCardIds).toEqual(originalCardIds);
		});

		it('should not mutate the original state (immutability)', () => {
			const state = createExodiaDeckState();
			const originalDeck = [...state.zones.deck];
			const command = new ShuffleDeckCommand();

			const result = command.execute(state);

			// 元の状態が変更されていないことを確認
			expect(state.zones.deck).toEqual(originalDeck);
			// 新しい状態は異なるオブジェクトであること
			expect(result.newState).not.toBe(state);
		});

		it('should fail when game is already over', () => {
			const state = createMockGameState({
				result: {
					isGameOver: true,
					victory: true,
					victoryReason: 'Exodia'
				}
			});
			const command = new ShuffleDeckCommand();

			const result = command.execute(state);

			expect(result.success).toBe(false);
			expect(result.error).toContain('game is already over');
			expect(result.newState).toBe(state); // State unchanged on failure
		});

		it('should handle empty deck without errors', () => {
			const state = createMockGameState({
				zones: {
					deck: [],
					hand: [],
					field: [],
					graveyard: [],
					banished: []
				}
			});
			const command = new ShuffleDeckCommand();

			const result = command.execute(state);

			expect(result.success).toBe(true);
			expect(result.newState.zones.deck).toEqual([]);
		});

		it('should handle single-card deck without errors', () => {
			const state = createMockGameState({
				zones: {
					deck: createCardInstances(['12345678'], 'deck'),
					hand: [],
					field: [],
					graveyard: [],
					banished: []
				}
			});
			const command = new ShuffleDeckCommand();

			const result = command.execute(state);

			expect(result.success).toBe(true);
			expect(result.newState.zones.deck.length).toBe(1);
			expect(result.newState.zones.deck[0].cardId).toBe('12345678');
		});
	});

	describe('description', () => {
		it('should have a descriptive name', () => {
			const command = new ShuffleDeckCommand();

			expect(command.description).toBe('Shuffle deck');
		});
	});
});
