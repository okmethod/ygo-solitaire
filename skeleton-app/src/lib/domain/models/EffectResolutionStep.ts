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
 * NotificationLevel - 効果解決ステップの通知レベル
 *
 * Domain層で定義され、Presentation層が表示方法を決定する。
 * - silent: 通知なし（内部状態変更のみ、即座に実行）
 * - info: 情報通知（トースト、非ブロッキング、自動進行）
 * - interactive: ユーザー入力要求（モーダル、ブロッキング）
 */
export type NotificationLevel = "silent" | "info" | "interactive";

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
 *   summary: "手札を捨てる",
 *   description: "手札から2枚選んで捨ててください",
 *   cancelable: false, // Cannot cancel during effect resolution
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
  /** Summary shown in selection UI */
  summary: string;
  /** Description/instructions shown in selection UI */
  description: string;
  /** Whether user can cancel the selection (default: true) */
  cancelable?: boolean;
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
 *   summary: "カードをドロー",
 *   description: "デッキから2枚ドローします",
 *   action: (state: GameState) => {
 *     return new DrawCardCommand(2).execute(state);
 *   }
 * };
 *
 * // Step with card selection (user input required)
 * const step: EffectResolutionStep = {
 *   id: "graceful-charity-discard",
 *   summary: "手札を捨てる",
 *   description: "手札から2枚選んで捨ててください",
 *   cardSelectionConfig: {
 *     availableCards: state.zones.hand,
 *     minCards: 2,
 *     maxCards: 2,
 *     summary: "手札を捨てる",
 *     description: "手札から2枚選んで捨ててください",
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

  /** Summary displayed to user */
  summary: string;

  /** Detailed description displayed to user */
  description: string;

  /**
   * Notification level (optional)
   *
   * Controls how this step is presented to the user:
   * - "silent": No notification, executes immediately (internal state changes)
   * - "info": Toast notification, non-blocking, auto-advance (informational)
   * - "interactive": Modal dialog, blocking, waits for user input (requires interaction)
   *
   * Default: "info" (for backward compatibility)
   */
  notificationLevel?: NotificationLevel;

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
