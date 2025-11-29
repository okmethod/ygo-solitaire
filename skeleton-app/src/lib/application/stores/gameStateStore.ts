/**
 * gameStateStore - Main game state store
 *
 * Svelte writable store for GameState.
 * This is the single source of truth for game state in the UI.
 *
 * @module application/stores/gameStateStore
 */

import { writable } from "svelte/store";
import type { GameState } from "$lib/domain/models/GameState";
import { createInitialGameState } from "$lib/domain/models/GameState";

/**
 * Create initial empty game state
 */
function createEmptyGameState(): GameState {
  return createInitialGameState([]);
}

/**
 * Main game state store (writable)
 *
 * Usage:
 * ```typescript
 * import { gameStateStore } from '$lib/application/stores/gameStateStore';
 *
 * // Subscribe to state changes
 * gameStateStore.subscribe(state => {
 *   console.log('Current phase:', state.phase);
 * });
 *
 * // Update state (from GameFacade)
 * gameStateStore.set(newState);
 * ```
 */
export const gameStateStore = writable<GameState>(createEmptyGameState());

/**
 * Reset store to initial state (数値ID対応版)（T025）
 *
 * @param deckCardIds - Array of numeric card IDs for the deck
 */
export function resetGameState(deckCardIds: number[]): void {
  gameStateStore.set(createInitialGameState(deckCardIds));
}

/**
 * Reset store to initial state (文字列ID互換版)
 *
 * @deprecated Use resetGameState with number IDs (T025)
 * @param deckCardIds - Array of string card IDs for the deck
 */
export function resetGameStateFromStringIds(deckCardIds: string[]): void {
  const numericIds = deckCardIds.map((id) => parseInt(id, 10));
  resetGameState(numericIds);
}

/**
 * Get current state snapshot (non-reactive)
 *
 * @returns Current game state
 */
export function getCurrentState(): GameState {
  let currentState: GameState = createEmptyGameState();
  const unsubscribe = gameStateStore.subscribe((state) => {
    currentState = state;
  });
  unsubscribe(); // Immediately unsubscribe
  return currentState;
}
