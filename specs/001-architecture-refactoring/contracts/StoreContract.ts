/**
 * Store Contract
 *
 * Defines how UI subscribes to game state changes.
 * Uses Svelte's writable/derived store pattern for Observer implementation.
 *
 * **Location**: Will be implemented in `application/stores/`
 * **Pattern**: Observer Pattern (via Svelte Store)
 * **Framework**: Svelte 5 compatible (works with both $state runes and stores)
 */

import type { Readable, Writable, Subscriber, Unsubscriber } from 'svelte/store';
import type { GameState, GamePhase } from '../domain/models/GameState';
import type { CardInstance } from '../domain/models/Card';

/**
 * Main game state store interface
 *
 * Wraps GameState in Svelte store for reactive UI updates.
 * UI components subscribe to this store and automatically re-render on state changes.
 *
 * **Implementation**: `application/stores/gameStateStore.ts`
 *
 * @example
 * ```typescript
 * // Create store
 * export const gameState: IGameStateStore = writable(initialGameState);
 *
 * // In Svelte component
 * import { gameState } from '$lib/application/stores/gameStateStore';
 *
 * // Subscribe (automatic cleanup on component destroy)
 * $: currentPhase = $gameState.phase;
 *
 * // Update
 * gameState.update(state => updateGameState(state, draft => {
 *   draft.phase = 'Main1';
 * }));
 * ```
 */
export interface IGameStateStore extends Writable<GameState> {
  /**
   * Subscribe to state changes
   *
   * @param run - Callback invoked when state changes
   * @returns Unsubscriber function to stop listening
   *
   * @example
   * ```typescript
   * const unsubscribe = gameState.subscribe(state => {
   *   console.log('Current phase:', state.phase);
   * });
   * // Later: unsubscribe();
   * ```
   */
  subscribe(run: Subscriber<GameState>): Unsubscriber;

  /**
   * Set new state (replaces entire state)
   *
   * @param value - New game state
   *
   * @example
   * ```typescript
   * gameState.set(newGameState);
   * ```
   */
  set(value: GameState): void;

  /**
   * Update state using updater function
   *
   * @param updater - Function that receives current state and returns new state
   *
   * @example
   * ```typescript
   * gameState.update(currentState => {
   *   return updateGameState(currentState, draft => {
   *     draft.zones.hand.push(drawnCard);
   *   });
   * });
   * ```
   */
  update(updater: (state: GameState) => GameState): void;
}

/**
 * Derived stores for computed values
 *
 * These stores automatically update when gameState changes.
 * Useful for UI components that only need specific data.
 *
 * **Implementation**: `application/stores/derivedStores.ts`
 */
export interface IDerivedStores {
  /**
   * Hand cards as readable store
   * Automatically updates when hand changes
   *
   * @example
   * ```svelte
   * <script>
   *   import { handCards } from '$lib/application/stores/derivedStores';
   * </script>
   *
   * {#each $handCards as card}
   *   <CardComponent {card} />
   * {/each}
   * ```
   */
  handCards: Readable<readonly CardInstance[]>;

  /**
   * Deck size (card count)
   *
   * @example
   * ```svelte
   * <div>残り枚数: {$deckSize}</div>
   * ```
   */
  deckSize: Readable<number>;

  /**
   * Hand size (card count)
   */
  handSize: Readable<number>;

  /**
   * Graveyard cards
   */
  graveyardCards: Readable<readonly CardInstance[]>;

  /**
   * Current phase
   */
  currentPhase: Readable<GamePhase>;

  /**
   * Current turn number
   */
  currentTurn: Readable<number>;

  /**
   * Player life points
   */
  playerLP: Readable<number>;

  /**
   * Opponent life points
   */
  opponentLP: Readable<number>;

  /**
   * Game over status
   */
  isGameOver: Readable<boolean>;

  /**
   * Victory status (if game is over)
   */
  hasWon: Readable<boolean>;

  /**
   * Monster zone cards (non-null only)
   */
  monsterZoneCards: Readable<readonly CardInstance[]>;

  /**
   * Spell/Trap zone cards (non-null only)
   */
  spellTrapZoneCards: Readable<readonly CardInstance[]>;

  /**
   * Empty spell/trap zone count
   */
  emptySpellTrapSlots: Readable<number>;

  /**
   * Chain stack size
   */
  chainStackSize: Readable<number>;
}

/**
 * Action history store
 *
 * Optional store for tracking game actions (for replay, undo/redo)
 *
 * **Implementation**: `application/stores/historyStore.ts` (future enhancement)
 */
export interface IHistoryStore extends Readable<readonly ActionHistoryEntry[]> {
  /**
   * Subscribe to action history
   */
  subscribe(run: Subscriber<readonly ActionHistoryEntry[]>): Unsubscriber;

  /**
   * Add action to history
   *
   * @param entry - Action history entry
   */
  addEntry(entry: ActionHistoryEntry): void;

  /**
   * Clear history
   */
  clear(): void;

  /**
   * Get history as array
   */
  getHistory(): readonly ActionHistoryEntry[];
}

/**
 * Action history entry
 * Records a single game action for replay/undo
 */
export interface ActionHistoryEntry {
  /**
   * Unique ID for this action
   */
  readonly id: string;

  /**
   * Timestamp of action
   */
  readonly timestamp: number;

  /**
   * Action type (command name)
   * @example "DrawCardCommand", "ActivateSpellCommand"
   */
  readonly actionType: string;

  /**
   * Human-readable description
   * @example "Draw 2 card(s)", "Activate Pot of Greed"
   */
  readonly description: string;

  /**
   * State before action
   */
  readonly stateBefore: GameState;

  /**
   * State after action
   */
  readonly stateAfter: GameState;

  /**
   * Action metadata (optional)
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Store creation utilities
 * Helper functions for creating stores
 */
export interface IStoreUtils {
  /**
   * Create derived store from gameState
   *
   * @param selector - Function to select data from GameState
   * @returns Readable store with selected data
   *
   * @example
   * ```typescript
   * const deckSize = createDerived(state => state.zones.deck.length);
   * ```
   */
  createDerived<T>(selector: (state: GameState) => T): Readable<T>;

  /**
   * Create computed store with custom equality check
   * Only updates if value actually changes (deep comparison)
   *
   * @param selector - Function to select data from GameState
   * @param equalsFn - Custom equality function
   * @returns Readable store with selected data
   */
  createComputed<T>(
    selector: (state: GameState) => T,
    equalsFn?: (a: T, b: T) => boolean
  ): Readable<T>;

  /**
   * Batch multiple store updates
   * Updates UI only once after all changes
   *
   * @param updates - Array of update functions
   *
   * @example
   * ```typescript
   * batchUpdates([
   *   () => gameState.update(s => drawCard(s)),
   *   () => gameState.update(s => advancePhase(s))
   * ]);
   * ```
   */
  batchUpdates(updates: Array<() => void>): void;
}
