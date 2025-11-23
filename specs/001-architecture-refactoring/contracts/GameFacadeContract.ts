/**
 * GameFacade Contract
 *
 * This is the single entry point for UI components to interact with game logic.
 * All operations are synchronous (state updates) or return promises (async effects).
 *
 * **Location**: Will be implemented in `application/GameFacade.ts`
 * **Consumers**: Svelte components in `presentation/`
 */

import type { GameState, GamePhase } from '../domain/models/GameState';
import type { CardInstance } from '../domain/models/Card';

/**
 * Main facade interface for UI-domain interaction
 *
 * @example
 * ```typescript
 * const facade = new GameFacade();
 * await facade.initializeGame('exodia-deck');
 * facade.drawCard();
 * const canActivate = facade.canActivateCard('card-instance-123');
 * if (canActivate) {
 *   await facade.activateSpell('card-instance-123');
 * }
 * ```
 */
export interface IGameFacade {
  /**
   * Initialize a new game with specified deck recipe
   *
   * @param deckRecipeId - Identifier for deck recipe (e.g., 'exodia-deck')
   * @returns Promise that resolves when game is initialized
   * @throws {Error} If deck recipe not found or invalid
   */
  initializeGame(deckRecipeId: string): Promise<void>;

  /**
   * Advance to the next phase
   * Transitions: Draw → Standby → Main1 → End → Draw (next turn)
   *
   * @throws {Error} If phase transition is invalid
   */
  advancePhase(): void;

  /**
   * Get current game phase
   *
   * @returns Current phase (Draw, Standby, Main1, End)
   */
  getCurrentPhase(): GamePhase;

  /**
   * Draw card(s) from deck to hand
   * Valid only during Draw phase
   *
   * @param count - Number of cards to draw (default: 1)
   * @throws {Error} If not in Draw phase or insufficient cards in deck
   */
  drawCard(count?: number): void;

  /**
   * Activate a spell card from hand
   * Valid only during Main1 phase
   *
   * @param cardInstanceId - Unique instance ID of the card in hand
   * @returns Promise with activation result (new state, success status, message)
   * @throws {Error} If card not in hand, not Main1 phase, or no empty spell/trap zone
   */
  activateSpell(cardInstanceId: string): Promise<ActivationResult>;

  /**
   * Get current game state (read-only)
   * UI should use this for rendering
   *
   * @returns Readonly copy of current GameState
   */
  getGameState(): Readonly<GameState>;

  /**
   * Check if a card can be activated
   * Performs pre-validation without executing
   *
   * @param cardInstanceId - Unique instance ID of the card
   * @returns true if card can be activated, false otherwise
   */
  canActivateCard(cardInstanceId: string): boolean;

  /**
   * Check current victory conditions
   * Should be called after each state change
   *
   * @returns VictoryResult with game over status and reason
   */
  checkVictory(): VictoryResult;
}

/**
 * Result of card activation
 * Contains new state and metadata about the activation
 */
export interface ActivationResult {
  /**
   * Whether activation succeeded
   */
  readonly success: boolean;

  /**
   * Human-readable message (e.g., "2枚ドロー", "発動できません")
   */
  readonly message: string;

  /**
   * New game state after activation
   */
  readonly newState: GameState;

  /**
   * Cards affected by this activation (optional)
   */
  readonly affectedCards?: readonly CardInstance[];

  /**
   * Cards drawn as part of activation (optional)
   */
  readonly drawnCards?: readonly CardInstance[];
}

/**
 * Result of victory condition check
 * Determines if game is over and who won
 */
export interface VictoryResult {
  /**
   * Whether the game has ended
   */
  readonly isGameOver: boolean;

  /**
   * Winner of the game (if game is over)
   */
  readonly winner?: 'player' | 'opponent';

  /**
   * Reason for game ending
   * - Exodia: Player collected all 5 Exodia pieces in hand
   * - LP0: A player's life points reached 0
   * - DeckOut: A player cannot draw when required
   */
  readonly reason?: 'Exodia' | 'LP0' | 'DeckOut';
}
