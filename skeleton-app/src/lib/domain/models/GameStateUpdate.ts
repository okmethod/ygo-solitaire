/**
 * GameStateUpdate - GameState更新モデルの型とインターフェース
 *
 * @module domain/models/GameStateUpdate
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";

/**
 * GameState更新結果の共通インターフェース
 *
 * すべてのゲーム状態更新操作（Command、Effect、Rule等）が返す統一結果型。
 */
export interface GameStateUpdateResult {
  readonly success: boolean;
  readonly updatedState: GameState;
  readonly message?: string;
  readonly error?: string;

  /**
   * 効果処理ステップ（オプショナル）
   *
   * Domain層がApplication層に効果処理を委譲する際に使用。
   * - ActivateSpellCommand.execute() が effectSteps を返す
   * - GameFacade.activateSpell() が effectResolutionStore.startResolution() を呼ぶ
   *
   * これにより、Domain層がApplication層の制御フローに依存しない設計を実現。
   */
  readonly effectSteps?: AtomicStep[];
}

/** 成功した GameStateUpdateResult を作成するヘルパー */
export function createSuccessResult(updatedState: GameState, message?: string): GameStateUpdateResult {
  return {
    success: true,
    updatedState,
    message,
  };
}

/** 失敗した GameStateUpdateResult を作成するヘルパー */
export function createFailureResult(state: GameState, error: string): GameStateUpdateResult {
  return {
    success: false,
    updatedState: state, // 状態は変更されない
    error,
  };
}
