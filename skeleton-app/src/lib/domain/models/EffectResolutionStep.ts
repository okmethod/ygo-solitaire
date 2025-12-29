/**
 * EffectResolutionStep - Domain definition for effect resolution steps
 *
 * Defines the structure for card effect resolution steps.
 * This is a domain-level interface that does not depend on application or presentation layers.
 *
 * @module domain/effects/EffectResolutionStep
 */

import type { GameState } from "../models/GameState";
import type { GameStateUpdateResult } from "../models/GameStateUpdateResult";
import type { CardInstance } from "../models/Card";

/**
 * Card Selection Configuration (Domain Layer)
 *
 * Configuration for requesting user to select cards.
 * This is a domain-level interface that does not depend on Svelte stores.
 *
 * @example
 * ```typescript
 * const config: CardSelectionConfig = {
 *   availableCards: state.zones.hand,
 *   minCards: 2,
 *   maxCards: 2,
 *   title: "カードを破棄",
 *   message: "手札から2枚選んで破棄してください",
 * };
 * ```
 */
export interface CardSelectionConfig {
  /** Available cards to choose from */
  availableCards: readonly CardInstance[];
  /** Minimum number of cards that must be selected */
  minCards: number;
  /** Maximum number of cards that can be selected */
  maxCards: number;
  /** Title shown in selection UI */
  title: string;
  /** Message/instructions shown in selection UI */
  message: string;
}

/**
 * Effect Resolution Step
 *
 * Represents a single step in a card effect resolution sequence.
 * Each step has a unique ID, title, message, and action callback.
 *
 * The action callback uses Dependency Injection pattern:
 * - Domain Layer: Returns callback function (state: GameState) => CommandResult
 * - Application Layer: Executes callback, injecting current GameState
 *
 * If `cardSelectionConfig` is provided, Application Layer will:
 * 1. Open CardSelectionModal with the configuration
 * 2. Wait for user to select cards
 * 3. Pass selected instanceIds to action callback
 *
 * @example
 * ```typescript
 * // Simple step (no user input required)
 * const step: EffectResolutionStep = {
 *   id: "pot-of-greed-draw",
 *   title: "カードをドローします",
 *   message: "デッキから2枚ドローします",
 *   action: (state: GameState) => {
 *     return new DrawCardCommand(2).execute(state);
 *   }
 * };
 *
 * // Step with card selection (user input required)
 * const step: EffectResolutionStep = {
 *   id: "graceful-charity-discard",
 *   title: "カードを破棄します",
 *   message: "手札から2枚選んで破棄してください",
 *   cardSelectionConfig: {
 *     availableCards: state.zones.hand,
 *     minCards: 2,
 *     maxCards: 2,
 *     title: "カードを破棄",
 *     message: "手札から2枚選んで破棄してください",
 *   },
 *   action: (state: GameState, selectedInstanceIds?: string[]) => {
 *     return new DiscardCardsCommand(selectedInstanceIds!).execute(state);
 *   }
 * };
 * ```
 */
export interface EffectResolutionStep {
  /** Unique identifier for this step */
  id: string;

  /** Title displayed to user */
  title: string;

  /** Detailed message displayed to user */
  message: string;

  /**
   * Card selection configuration (optional)
   *
   * If provided, Application Layer will open CardSelectionModal before executing action.
   * Selected card instanceIds will be passed to action callback as second parameter.
   */
  cardSelectionConfig?: CardSelectionConfig;

  /**
   * Action callback executed when step is confirmed
   *
   * Callback Pattern + Dependency Injection:
   * - GameState is injected by Application Layer at execution time
   * - Returns GameStateUpdateResult with new state
   * - Synchronous function only (non-async) for type safety
   *
   * If cardSelectionConfig is provided:
   * - selectedInstanceIds parameter will contain user-selected card instance IDs
   * - Otherwise, selectedInstanceIds will be undefined
   *
   * @see research.md#2-effectSteps-の型安全性と非同期処理
   */
  action: (state: GameState, selectedInstanceIds?: string[]) => GameStateUpdateResult;

  /** Whether to show cancel button (optional) */
  showCancel?: boolean;
}
