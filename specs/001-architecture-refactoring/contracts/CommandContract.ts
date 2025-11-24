/**
 * Command Contract
 *
 * All player actions are encapsulated as commands.
 * Commands must be pure - they create new state instead of mutating.
 *
 * **Location**: Will be implemented in `application/commands/`
 * **Pattern**: Command Pattern (Gang of Four)
 */

import type { GameState, GamePhase } from '../domain/models/GameState';

/**
 * Base command interface for all game actions
 *
 * Commands encapsulate player actions (draw, activate spell, advance phase).
 * They are immutable and return new GameState instead of modifying existing state.
 *
 * @example
 * ```typescript
 * const command = new DrawCardCommand(2);
 * if (command.canExecute(currentState)) {
 *   const newState = command.execute(currentState);
 *   // currentState is unchanged
 * }
 * ```
 */
export interface IGameCommand {
  /**
   * Human-readable description of this command
   * Used for logging, history, and potential undo/redo
   *
   * @example "Draw 2 card(s)", "Activate Pot of Greed", "Advance to Main1 phase"
   */
  readonly description: string;

  /**
   * Pre-execution validation
   * Check if command can be executed in current state
   *
   * @param state - Current game state
   * @returns true if command can execute, false otherwise
   *
   * @example
   * ```typescript
   * canExecute(state: GameState): boolean {
   *   return state.phase === 'Draw' && state.zones.deck.length >= 1;
   * }
   * ```
   */
  canExecute(state: GameState): boolean;

  /**
   * Execute command and return new state (immutable)
   * Must not modify the input state
   *
   * @param state - Current game state (will not be modified)
   * @returns New game state with changes applied, or Promise of new state
   * @throws {Error} If command cannot execute (should check canExecute first)
   *
   * @example
   * ```typescript
   * execute(state: GameState): GameState {
   *   return updateGameState(state, draft => {
   *     const card = draft.zones.deck.pop()!;
   *     draft.zones.hand.push(card);
   *   });
   * }
   * ```
   */
  execute(state: GameState): GameState | Promise<GameState>;
}

/**
 * Command to draw cards from deck to hand
 * Valid only during Draw phase
 *
 * **Implementation**: `application/commands/DrawCardCommand.ts`
 */
export interface IDrawCardCommand extends IGameCommand {
  /**
   * Number of cards to draw
   */
  readonly count: number;

  /**
   * Check if enough cards in deck
   *
   * @param state - Current game state
   * @returns true if deck has at least 'count' cards
   */
  hasEnoughCards(state: GameState): boolean;

  /**
   * Check if in Draw phase
   *
   * @param state - Current game state
   * @returns true if current phase is Draw
   */
  isDrawPhase(state: GameState): boolean;
}

/**
 * Command to activate a spell card from hand
 * Valid only during Main1 phase (MVP scope: normal spells only)
 *
 * **Implementation**: `application/commands/ActivateSpellCommand.ts`
 */
export interface IActivateSpellCommand extends IGameCommand {
  /**
   * Unique instance ID of the spell card to activate
   */
  readonly cardInstanceId: string;

  /**
   * Check if spell/trap zone has empty slot
   *
   * @param state - Current game state
   * @returns true if at least one slot is null
   */
  hasEmptySpellZone(state: GameState): boolean;

  /**
   * Check if in Main1 phase
   *
   * @param state - Current game state
   * @returns true if current phase is Main1
   */
  isInMainPhase(state: GameState): boolean;

  /**
   * Check if card exists in hand
   *
   * @param state - Current game state
   * @returns true if card with cardInstanceId exists in hand
   */
  isCardInHand(state: GameState): boolean;
}

/**
 * Command to advance to next phase
 * Transitions: Draw → Standby → Main1 → End → Draw (next turn)
 *
 * **Implementation**: `application/commands/AdvancePhaseCommand.ts`
 */
export interface IAdvancePhaseCommand extends IGameCommand {
  /**
   * Target phase to transition to (if specified)
   * If not specified, advances to next phase in sequence
   */
  readonly targetPhase?: GamePhase;

  /**
   * Get next phase in sequence
   *
   * @param current - Current phase
   * @returns Next phase in the sequence
   */
  getNextPhase(current: GamePhase): GamePhase;

  /**
   * Check if phase transition is valid
   *
   * @param from - Current phase
   * @param to - Target phase
   * @returns true if transition is valid
   */
  isValidTransition(from: GamePhase, to: GamePhase): boolean;
}

/**
 * Command execution result (for logging/history)
 * Optional - commands can return this for additional metadata
 */
export interface CommandResult {
  /**
   * Whether command executed successfully
   */
  readonly success: boolean;

  /**
   * New state after command execution
   */
  readonly newState: GameState;

  /**
   * Optional message about execution
   */
  readonly message?: string;

  /**
   * Timestamp of execution
   */
  readonly timestamp?: number;
}
