/**
 * derivedStores - Derived game state stores
 *
 * Computed properties derived from main gameStateStore.
 * These are read-only stores that automatically update when gameState changes.
 *
 * @module application/stores/derivedStores
 */

import { derived } from "svelte/store";
import { gameStateStore } from "./gameStateStore";
import { hasActivatableSpells } from "$lib/domain/rules/SpellActivationRule";
import { countExodiaPiecesInHand } from "$lib/domain/models/GameState";

/**
 * Current game phase (read-only)
 *
 * Usage in Svelte:
 * ```svelte
 * <script>
 *   import { currentPhase } from '$lib/application/stores/derivedStores';
 * </script>
 * <div>Current Phase: {$currentPhase}</div>
 * ```
 */
export const currentPhase = derived(gameStateStore, ($state) => $state.phase);

/**
 * Current turn number (read-only)
 */
export const currentTurn = derived(gameStateStore, ($state) => $state.turn);

/**
 * Player's life points (read-only)
 */
export const playerLP = derived(gameStateStore, ($state) => $state.lp.player);

/**
 * Opponent's life points (read-only)
 */
export const opponentLP = derived(gameStateStore, ($state) => $state.lp.opponent);

/**
 * Hand card count (read-only)
 */
export const handCardCount = derived(gameStateStore, ($state) => $state.zones.hand.length);

/**
 * Deck card count (read-only)
 */
export const deckCardCount = derived(gameStateStore, ($state) => $state.zones.deck.length);

/**
 * Graveyard card count (read-only)
 */
export const graveyardCardCount = derived(gameStateStore, ($state) => $state.zones.graveyard.length);

/**
 * Field card count (read-only)
 */
export const fieldCardCount = derived(gameStateStore, ($state) => $state.zones.field.length);

/**
 * Number of Exodia pieces in hand (0-5) (read-only)
 */
export const exodiaPieceCount = derived(gameStateStore, ($state) => countExodiaPiecesInHand($state));

/**
 * Whether game is over (read-only)
 */
export const isGameOver = derived(gameStateStore, ($state) => $state.result.isGameOver);

/**
 * Game result (read-only)
 */
export const gameResult = derived(gameStateStore, ($state) => $state.result);

/**
 * Whether any spells can be activated (read-only)
 * Useful for enabling/disabling spell activation UI
 */
export const canActivateSpells = derived(gameStateStore, ($state) => hasActivatableSpells($state));

/**
 * Whether deck is empty (read-only)
 */
export const isDeckEmpty = derived(gameStateStore, ($state) => $state.zones.deck.length === 0);

/**
 * Whether hand is empty (read-only)
 */
export const isHandEmpty = derived(gameStateStore, ($state) => $state.zones.hand.length === 0);

/**
 * Chain stack size (read-only)
 */
export const chainStackSize = derived(gameStateStore, ($state) => $state.chainStack.length);
