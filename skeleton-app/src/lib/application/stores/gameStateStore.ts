/**
 * gameStateStore - Main game state store
 *
 * Svelte writable store for GameState.
 * This is the single source of truth for game state in the UI.
 *
 * ARCH: Application Layer - レイヤー依存ルール
 * - Application Layer は Domain Layer に依存できる
 * - Presentation Layer は Application Layer（GameFacade、Stores）のみに依存する
 * - Presentation Layer は Domain Layer に直接依存してはいけない
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
 * Reset store to initial state
 *
 * @param deckCardIds - Array of numeric card IDs for the deck
 */
export function resetGameState(deckCardIds: number[]): void {
  gameStateStore.set(createInitialGameState(deckCardIds));
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
