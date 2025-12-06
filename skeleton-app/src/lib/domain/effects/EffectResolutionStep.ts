/**
 * EffectResolutionStep - Domain definition for effect resolution steps
 *
 * Defines the structure for card effect resolution steps.
 * This is a domain-level interface that does not depend on application or presentation layers.
 *
 * @module domain/effects/EffectResolutionStep
 */

import type { GameState } from "../models/GameState";
import type { CommandResult } from "../commands/CommandResult";

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
 * @example
 * ```typescript
 * const step: EffectResolutionStep = {
 *   id: "pot-of-greed-draw",
 *   title: "カードをドローします",
 *   message: "デッキから2枚ドローします",
 *   action: (state: GameState) => {
 *     return new DrawCardCommand(2).execute(state);
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
   * Action callback executed when step is confirmed
   *
   * Callback Pattern + Dependency Injection:
   * - GameState is injected by Application Layer at execution time
   * - Returns CommandResult with new state
   * - Can be async (Promise<CommandResult>) or sync (CommandResult)
   */
  action: (state: GameState) => Promise<CommandResult> | CommandResult;

  /** Whether to show cancel button (optional) */
  showCancel?: boolean;
}
