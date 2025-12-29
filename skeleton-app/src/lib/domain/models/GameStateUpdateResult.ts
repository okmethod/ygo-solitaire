/**
 * GameStateUpdateResult - Result of GameState update operations
 *
 * This is a domain-level interface used by Commands, Effects, and other operations
 * that update the GameState. It does not depend on application or presentation layers.
 *
 * @module domain/models/GameStateUpdateResult
 */

import type { GameState } from "./GameState";
import type { EffectResolutionStep } from "../effects/EffectResolutionStep";

/**
 * Result of GameState update operations
 *
 * Used by:
 * - Commands (DrawCardCommand, ActivateSpellCommand, etc.)
 * - Effects (EffectResolutionStep)
 * - Any domain operation that updates GameState
 */
export interface GameStateUpdateResult {
  readonly success: boolean;
  readonly newState: GameState;
  readonly message?: string;
  readonly error?: string;

  /**
   * 効果解決ステップ（オプショナル）
   *
   * Domain層がApplication層に効果解決を委譲する際に使用。
   * - ActivateSpellCommand.execute() が effectSteps を返す
   * - GameFacade.activateSpell() が effectResolutionStore.startResolution() を呼ぶ
   *
   * これにより、Domain層がApplication層の制御フローに依存しない設計を実現。
   *
   * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
   */
  readonly effectSteps?: EffectResolutionStep[];
}

/**
 * Helper to create a successful update result
 */
export function createSuccessResult(newState: GameState, message?: string): GameStateUpdateResult {
  return {
    success: true,
    newState,
    message,
  };
}

/**
 * Helper to create a failed update result
 */
export function createFailureResult(state: GameState, error: string): GameStateUpdateResult {
  return {
    success: false,
    newState: state, // Return unchanged state on failure
    error,
  };
}
