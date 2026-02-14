/**
 * GameStateUpdate - ゲーム状態更新モデル
 *
 * @module domain/models/GameStateUpdate
 * @see {@link docs/domain/overview.md}
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { GameEvent } from "$lib/domain/models/EventTimeline";

/**
 * ゲーム状態更新結果の共通インターフェース
 *
 * すべてのゲーム状態更新操作（Command、Effect、Rule等）が、このインターフェースを返す。
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
   * - GameFacade.activateSpell() が effectQueueStore.startProcessing() を呼ぶ
   *
   * これにより、Domain層がApplication層の制御フローに依存しない設計を実現。
   */
  readonly effectSteps?: AtomicStep[];

  /**
   * 発行されたドメインイベント（オプショナル）
   *
   * AtomicStep.action() が発行したイベントを返す。
   * effectQueueStore がイベントを検出し、トリガールールを自動挿入する。
   */
  readonly emittedEvents?: GameEvent[];
}

/** 成功した GameStateUpdateResult */
export const successUpdateResult = (
  updatedState: GameState,
  message?: string,
  effectSteps?: AtomicStep[],
  emittedEvents?: GameEvent[],
): GameStateUpdateResult => {
  return {
    success: true,
    updatedState,
    message,
    effectSteps,
    emittedEvents,
  };
};

/** 失敗した GameStateUpdateResult */
export const failureUpdateResult = (state: GameState, error: string): GameStateUpdateResult => {
  return {
    success: false,
    updatedState: state, // 状態は変更されない
    error,
  };
};
