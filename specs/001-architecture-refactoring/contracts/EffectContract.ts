/**
 * Effect Contract (Adapter)
 *
 * Adapts existing BaseEffect/DrawEffect/etc. to work with immutable GameState.
 * This contract bridges the existing effect system with the new architecture.
 *
 * **Location**: Will adapt existing `domain/effects/` classes
 * **Pattern**: Adapter Pattern (wraps existing Strategy Pattern implementation)
 * **Migration**: Existing BaseEffect hierarchy with minimal changes
 */

import type { GameState } from '../domain/models/GameState';
import type { CardInstance } from '../domain/models/Card';

/**
 * Card effect interface
 *
 * Existing effect classes (BaseEffect, DrawEffect, PotOfGreedEffect, etc.)
 * will implement this interface with minimal changes.
 *
 * **Key Change**: `execute()` now returns new GameState instead of mutating DuelState
 *
 * @example
 * ```typescript
 * // Before (mutating DuelState):
 * class PotOfGreedEffect extends BaseMagicEffect {
 *   async resolveMagicEffect(state: DuelState): Promise<EffectResult> {
 *     const drawn = state.drawCard(2); // mutates state
 *     return { success: true, message: '2枚ドロー' };
 *   }
 * }
 *
 * // After (immutable GameState):
 * class PotOfGreedEffect extends BaseMagicEffect {
 *   async resolveMagicEffect(state: GameState): Promise<EffectResult> {
 *     const newState = updateGameState(state, draft => {
 *       for (let i = 0; i < 2; i++) {
 *         const card = draft.zones.deck.pop()!;
 *         draft.zones.hand.push(card);
 *       }
 *     });
 *     return {
 *       success: true,
 *       message: '2枚ドロー',
 *       newState, // NEW: return new state
 *       drawnCards: newState.zones.hand.slice(-2)
 *     };
 *   }
 * }
 * ```
 */
export interface ICardEffect {
  /**
   * Card ID this effect belongs to
   * Maps to CardData.id
   */
  readonly cardId: number;

  /**
   * Effect name (human-readable)
   * @example "Pot of Greed Draw Effect", "Graceful Charity Draw and Discard"
   */
  readonly effectName: string;

  /**
   * Effect description (from card text)
   * @example "Draw 2 cards"
   */
  readonly description: string;

  /**
   * Unique effect ID (for chain management)
   * @example "pot-of-greed-55144522-draw"
   */
  readonly id: string;

  /**
   * Check if effect can be activated in current state
   *
   * @param state - Current game state
   * @param cardInstanceId - Instance ID of the card attempting activation
   * @returns true if effect can be activated
   *
   * @example
   * ```typescript
   * canActivate(state: GameState, cardInstanceId: string): boolean {
   *   // Check phase, card location, costs, etc.
   *   return state.phase === 'Main1' &&
   *          state.zones.hand.some(c => c.instanceId === cardInstanceId);
   * }
   * ```
   */
  canActivate(state: GameState, cardInstanceId: string): boolean;

  /**
   * Execute effect and return new game state
   * **CRITICAL**: Must return new GameState, not mutate input state
   *
   * @param state - Current game state (will not be modified)
   * @param cardInstanceId - Instance ID of the card being activated
   * @returns Promise of EffectResult with new state
   * @throws {Error} If effect cannot execute
   *
   * @example
   * ```typescript
   * async execute(state: GameState, cardInstanceId: string): Promise<EffectResult> {
   *   const newState = updateGameState(state, draft => {
   *     // Apply effect changes to draft
   *     draft.zones.deck.pop();
   *     draft.zones.hand.push(drawnCard);
   *   });
   *
   *   return {
   *     success: true,
   *     message: 'Effect resolved',
   *     newState, // Return new state
   *   };
   * }
   * ```
   */
  execute(state: GameState, cardInstanceId: string): Promise<EffectResult>;
}

/**
 * Result of effect execution
 * Contains new state and metadata about what happened
 */
export interface EffectResult {
  /**
   * New game state after effect execution
   * **REQUIRED**: Effects must return new state (immutability)
   */
  readonly newState: GameState;

  /**
   * Whether effect executed successfully
   */
  readonly success: boolean;

  /**
   * Human-readable message about effect
   * @example "2枚ドロー", "手札を2枚捨てる", "発動できません"
   */
  readonly message: string;

  /**
   * Action logs (for history/replay)
   * @example ["Draw 1 card from deck", "Add card to hand"]
   */
  readonly logs?: readonly string[];

  /**
   * Cards affected by this effect
   * Used for UI animation/highlighting
   */
  readonly affectedCards?: readonly CardInstance[];

  /**
   * Cards drawn as part of this effect
   * Useful for DrawEffect and derived effects
   */
  readonly drawnCards?: readonly CardInstance[];

  /**
   * Cards discarded as part of this effect
   * Useful for DiscardEffect
   */
  readonly discardedCards?: readonly CardInstance[];

  /**
   * Whether this effect ended the game
   * Effects can trigger victory conditions (e.g., final Exodia piece drawn)
   */
  readonly gameEnded?: boolean;
}

/**
 * Primitive effect interface for reusable effect building blocks
 *
 * Existing primitives: DrawEffect, DiscardEffect, SearchEffect, etc.
 * These can be composed to create complex card effects.
 *
 * **Implementation**: `domain/effects/primitives/`
 */
export interface IPrimitiveEffect extends ICardEffect {
  /**
   * Configuration for primitive effect
   * Allows parameterization (e.g., draw count, discard count)
   */
  readonly config: EffectConfig;
}

/**
 * Effect configuration
 * Used for parameterizing primitive effects
 */
export interface EffectConfig {
  /**
   * Number of cards to draw (for DrawEffect)
   */
  readonly drawCount?: number;

  /**
   * Number of cards to discard (for DiscardEffect)
   */
  readonly discardCount?: number;

  /**
   * Whether effect is mandatory or optional
   */
  readonly mandatory?: boolean;

  /**
   * Custom validation function
   */
  readonly customValidator?: (state: GameState) => boolean;
}

/**
 * Base effect abstract class interface
 *
 * Existing BaseEffect will implement this interface structure
 * Provides common functionality for all effects
 *
 * **Implementation**: `domain/effects/bases/BaseEffect.ts`
 */
export interface IBaseEffect extends ICardEffect {
  /**
   * Pre-execution processing
   * Common checks and setup before effect execution
   *
   * @param state - Current game state
   * @returns true if pre-processing succeeds
   */
  preExecute(state: GameState): boolean;

  /**
   * Post-execution processing
   * Victory check, cleanup, logging
   *
   * @param state - New game state after effect
   * @returns Final effect result with post-processing applied
   */
  postExecute(state: GameState, result: EffectResult): EffectResult;

  /**
   * Error handling
   * Standardized error handling for all effects
   *
   * @param error - Error that occurred
   * @param state - Current game state
   * @returns EffectResult with error information
   */
  handleError(error: Error, state: GameState): EffectResult;
}

/**
 * Magic effect base interface
 * For spell card effects (extends BaseEffect)
 *
 * **Implementation**: `domain/effects/bases/BaseMagicEffect.ts`
 */
export interface IBaseMagicEffect extends IBaseEffect {
  /**
   * Resolve magic effect
   * Template method for magic card effect resolution
   *
   * @param state - Current game state
   * @returns Promise of effect result with new state
   */
  resolveMagicEffect(state: GameState): Promise<EffectResult>;
}

/**
 * Effect repository interface (Factory Pattern)
 * Manages effect instances and provides access by card ID
 *
 * **Implementation**: Existing `domain/effects/EffectRepository.ts` (minimal changes)
 */
export interface IEffectRepository {
  /**
   * Register effect for a card ID
   *
   * @param cardId - Card ID (e.g., 55144522 for Pot of Greed)
   * @param effectFactory - Factory function that creates effect instance
   */
  register(cardId: number, effectFactory: () => ICardEffect[]): void;

  /**
   * Get effects for a card ID
   *
   * @param cardId - Card ID
   * @returns Array of effects (most cards have 1, some have multiple)
   */
  getEffects(cardId: number): ICardEffect[];

  /**
   * Check if card has registered effects
   *
   * @param cardId - Card ID
   * @returns true if effects are registered
   */
  hasEffects(cardId: number): boolean;

  /**
   * Clear all registered effects
   * Used for testing or resetting
   */
  clear(): void;
}
