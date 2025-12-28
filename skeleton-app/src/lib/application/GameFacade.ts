/**
 * GameFacade - Main application facade
 *
 * Provides a simple API for UI components to interact with game logic.
 * This is the single entry point for all game operations.
 *
 * @module application/GameFacade
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GamePhase } from "$lib/domain/models/Phase";
import { gameStateStore, resetGameState, getCurrentState } from "./stores/gameStateStore";
import { DrawCardCommand } from "$lib/domain/commands/DrawCardCommand";
import { AdvancePhaseCommand } from "$lib/domain/commands/AdvancePhaseCommand";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { ShuffleDeckCommand } from "$lib/domain/commands/ShuffleDeckCommand";
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";
import { canActivateSpell } from "$lib/domain/rules/SpellActivationRule";
import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";
import "$lib/domain/effects"; // Initialize ChainableActionRegistry and AdditionalRuleRegistry

/**
 * GameFacade class
 *
 * Usage:
 * ```typescript
 * import { gameFacade } from '$lib/application/GameFacade';
 *
 * // Initialize game
 * gameFacade.initializeGame(['card1', 'card2', ...]);
 *
 * // Draw cards
 * gameFacade.drawCard(2);
 *
 * // Advance phase
 * gameFacade.advancePhase();
 * ```
 */
export class GameFacade {
  /**
   * Initialize a new game with given deck
   *
   * @param deckCardIds - Array of numeric card IDs for the main deck
   */
  initializeGame(deckCardIds: number[]): void {
    resetGameState(deckCardIds);
  }

  /**
   * Shuffle the deck
   *
   * @returns Success/failure result
   */
  shuffleDeck(): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentState();
    const command = new ShuffleDeckCommand();

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /**
   * Draw cards from deck to hand
   *
   * @param count - Number of cards to draw (default: 1)
   * @returns Success/failure result
   */
  drawCard(count: number = 1): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentState();
    const command = new DrawCardCommand(count);

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /**
   * Advance to next phase
   *
   * @returns Success/failure result
   */
  advancePhase(): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentState();
    const command = new AdvancePhaseCommand();

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /**
   * Get current phase (read-only)
   *
   * @returns Current game phase
   */
  getCurrentPhase(): GamePhase {
    return getCurrentState().phase;
  }

  /**
   * Get current game state (read-only)
   *
   * @returns Current game state snapshot
   */
  getGameState(): GameState {
    return getCurrentState();
  }

  /**
   * Activate a spell card from hand
   *
   * @param cardInstanceId - Card instance ID to activate
   * @returns Success/failure result
   */
  activateSpell(cardInstanceId: string): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentState();
    const command = new ActivateSpellCommand(cardInstanceId);

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);

      // If effectSteps are returned, delegate to Application Layer
      if (result.effectSteps && result.effectSteps.length > 0) {
        effectResolutionStore.startResolution(result.effectSteps);
      }
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /**
   * Check if a spell card can be activated
   *
   * @param cardInstanceId - Card instance ID to check
   * @returns Validation result
   */
  canActivateCard(cardInstanceId: string): boolean {
    const currentState = getCurrentState();
    const validation = canActivateSpell(currentState, cardInstanceId);
    return validation.canActivate;
  }

  /**
   * Check victory conditions
   *
   * @returns Game result with victory/defeat information
   */
  checkVictory(): { isGameOver: boolean; winner?: string; reason?: string; message?: string } {
    const currentState = getCurrentState();
    return checkVictoryConditions(currentState);
  }

  /**
   * Get current turn number
   *
   * @returns Turn number
   */
  getCurrentTurn(): number {
    return getCurrentState().turn;
  }

  /**
   * Get player's current life points
   *
   * @returns Player's LP
   */
  getPlayerLP(): number {
    return getCurrentState().lp.player;
  }

  /**
   * Get opponent's current life points
   *
   * @returns Opponent's LP
   */
  getOpponentLP(): number {
    return getCurrentState().lp.opponent;
  }
}

/**
 * Singleton instance of GameFacade
 * Use this instance throughout the application
 */
export const gameFacade = new GameFacade();
