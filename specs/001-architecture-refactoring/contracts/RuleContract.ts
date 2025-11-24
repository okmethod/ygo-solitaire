/**
 * Rule Contracts
 *
 * Rules are stateless validators and processors.
 * They encapsulate game logic knowledge (Phase transitions, Spell activation, Chain resolution, Victory).
 *
 * **Location**: Will be implemented in `domain/rules/`
 * **Pattern**: Strategy Pattern for rule-specific logic
 */

import type { GameState, GamePhase } from '../domain/models/GameState';
import type { ChainBlock } from '../domain/models/GameState';

/**
 * Phase transition rules
 * Validates and manages phase transitions
 *
 * **Implementation**: `domain/rules/PhaseRule.ts`
 */
export interface IPhaseRule {
  /**
   * Check if phase transition is valid
   *
   * @param from - Current phase
   * @param to - Target phase
   * @returns true if transition is allowed
   *
   * @example
   * ```typescript
   * canTransition('Draw', 'Standby') // true
   * canTransition('Draw', 'Main1')   // false (must go through Standby)
   * ```
   */
  canTransition(from: GamePhase, to: GamePhase): boolean;

  /**
   * Get next phase in sequence
   * MVP scope: Draw → Standby → Main1 → End → Draw (next turn)
   *
   * @param current - Current phase
   * @returns Next phase in the sequence
   *
   * @example
   * ```typescript
   * nextPhase('Draw')    // 'Standby'
   * nextPhase('Main1')   // 'End'
   * nextPhase('End')     // 'Draw' (new turn)
   * ```
   */
  nextPhase(current: GamePhase): GamePhase;

  /**
   * Validate a sequence of phase transitions
   * Useful for replaying game or validating history
   *
   * @param phases - Array of phases in order
   * @returns true if all transitions are valid
   *
   * @example
   * ```typescript
   * validatePhaseOrder(['Draw', 'Standby', 'Main1', 'End']) // true
   * validatePhaseOrder(['Draw', 'Main1', 'End'])             // false
   * ```
   */
  validatePhaseOrder(phases: GamePhase[]): boolean;
}

/**
 * Spell activation rules
 * Validates conditions for activating spell cards
 * MVP scope: Normal spells only, Main1 phase only
 *
 * **Implementation**: `domain/rules/SpellActivationRule.ts`
 */
export interface ISpellActivationRule {
  /**
   * Check if spell card can be activated
   * Combines all validation checks (phase, location, zone availability)
   *
   * @param state - Current game state
   * @param cardInstanceId - Unique ID of the spell card
   * @returns true if spell can be activated
   */
  canActivate(state: GameState, cardInstanceId: string): boolean;

  /**
   * Check if current phase allows spell activation
   * MVP scope: Main1 only
   *
   * @param state - Current game state
   * @returns true if phase is Main1
   */
  isCorrectPhase(state: GameState): boolean;

  /**
   * Check if card exists in hand
   *
   * @param state - Current game state
   * @param cardInstanceId - Unique ID of the card
   * @returns true if card is in hand
   */
  isCardInHand(state: GameState, cardInstanceId: string): boolean;

  /**
   * Check if spell/trap zone has empty slot
   *
   * @param state - Current game state
   * @returns true if at least one spell/trap zone slot is null
   */
  hasEmptyZone(state: GameState): boolean;

  /**
   * Get index of first empty spell/trap zone slot
   *
   * @param state - Current game state
   * @returns Index (0-4) of first empty slot, or -1 if none
   */
  getEmptyZoneIndex(state: GameState): number;
}

/**
 * Chain resolution rules
 * Manages chain stack and LIFO resolution
 * MVP scope: Simple chain without interruptions
 *
 * **Implementation**: `domain/rules/ChainRule.ts`
 */
export interface IChainRule {
  /**
   * Add effect to chain stack
   *
   * @param state - Current game state
   * @param effectId - Unique identifier of the effect
   * @param cardInstanceId - Card instance that triggered the effect
   * @returns New state with effect added to chain
   *
   * @example
   * ```typescript
   * const newState = addToChain(state, 'pot-of-greed-effect', 'card-123');
   * // newState.chainStack = [...state.chainStack, { effectId, cardInstanceId, chainIndex: 1 }]
   * ```
   */
  addToChain(state: GameState, effectId: string, cardInstanceId: string): GameState;

  /**
   * Resolve chain in LIFO order (Last In, First Out)
   * MVP scope: No opponent interruptions, simple sequential resolution
   *
   * @param state - Current game state with chain stack
   * @returns Promise of new state after all chain blocks resolved
   *
   * @example
   * ```typescript
   * // Chain: [Effect1, Effect2, Effect3]
   * // Resolution order: Effect3 → Effect2 → Effect1 (LIFO)
   * const newState = await resolveChain(state);
   * // newState.chainStack = [] (cleared)
   * ```
   */
  resolveChain(state: GameState): Promise<GameState>;

  /**
   * Check if chain stack is empty
   *
   * @param state - Current game state
   * @returns true if chainStack length is 0
   */
  isChainEmpty(state: GameState): boolean;

  /**
   * Clear chain stack
   * Used after chain resolution completes
   *
   * @param state - Current game state
   * @returns New state with empty chain stack
   */
  clearChain(state: GameState): GameState;
}

/**
 * Victory condition rules
 * Checks win/lose conditions (Exodia, LP=0, Deck Out)
 *
 * **Implementation**: `domain/rules/VictoryRule.ts`
 */
export interface IVictoryRule {
  /**
   * Check all victory conditions
   * Priority: Exodia > LP=0 > Deck Out
   *
   * @param state - Current game state
   * @returns VictoryResult with game over status and reason
   *
   * @example
   * ```typescript
   * const result = checkVictory(state);
   * if (result.isGameOver && result.winner === 'player') {
   *   console.log(`Victory by ${result.reason}`);
   * }
   * ```
   */
  checkVictory(state: GameState): VictoryResult;

  /**
   * Check Exodia victory condition
   * Player has all 5 Exodia pieces in hand
   *
   * @param state - Current game state
   * @returns true if all 5 Exodia pieces are in hand
   *
   * Exodia pieces (card IDs):
   * - 33396948: Exodia the Forbidden One
   * - 7902349: Right Arm of the Forbidden One
   * - 70903634: Left Arm of the Forbidden One
   * - 8124921: Right Leg of the Forbidden One
   * - 44519536: Left Leg of the Forbidden One
   */
  checkExodia(state: GameState): boolean;

  /**
   * Check life points victory/loss condition
   *
   * @param state - Current game state
   * @returns VictoryResult if LP=0 for either player, otherwise ongoing
   */
  checkLifePoints(state: GameState): VictoryResult | null;

  /**
   * Check deck out condition
   * Player cannot draw when required (deck is empty in Draw phase)
   *
   * @param state - Current game state
   * @returns true if player loses by deck out
   */
  checkDeckOut(state: GameState): boolean;
}

/**
 * Victory check result
 */
export interface VictoryResult {
  /**
   * Whether the game has ended
   */
  readonly isGameOver: boolean;

  /**
   * Winner if game is over
   */
  readonly winner?: 'player' | 'opponent';

  /**
   * Reason for game ending
   * - Exodia: Player has all 5 Exodia pieces in hand
   * - LP0: A player's life points reached 0
   * - DeckOut: Player cannot draw when required
   */
  readonly reason?: 'Exodia' | 'LP0' | 'DeckOut';
}
