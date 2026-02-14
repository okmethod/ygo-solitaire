/**
 * GameStateUpdate - ゲーム状態更新結果モデル
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { GameEvent } from "./GameEvent";

/**
 * ゲーム状態更新結果の共通インターフェース
 *
 * すべてのゲーム状態更新操作（Command、Effect、Rule等）が、このインターフェースを返す。
 */
export interface GameStateUpdateResult {
  readonly success: boolean;
  readonly updatedState: GameSnapshot;
  readonly message?: string;

  /**
   * 失敗した場合のエラーメッセージ（オプショナル）
   *
   * 事前にチェックしてから状態を更新するため、原則このタイミングで失敗することはない。
   * そのため、このエラーは想定外の問題が発生した場合のためのものであり、ユーザーに表示するためのものではない。
   * なお、チェック時には有効だったが、状態更新時には無効になってしまうケース（不発）は、
   * ルール上発生しうるため、正常処理（success: true）として扱う。
   */
  readonly error?: string;

  /**
   * 発行されたドメインイベント（オプショナル）
   *
   * AtomicStep.action() が発行したイベントを返す。
   * stepQueueStore がイベントを検出し、トリガールールを自動挿入する。
   */
  readonly emittedEvents?: GameEvent[];
}

/** 成功した GameStateUpdateResult */
export const successUpdateResult = (
  updatedState: GameSnapshot,
  message?: string,
  emittedEvents?: GameEvent[],
): GameStateUpdateResult => {
  return {
    success: true,
    updatedState,
    message,
    emittedEvents,
  };
};

/** 失敗した GameStateUpdateResult */
export const failureUpdateResult = (state: GameSnapshot, error: string): GameStateUpdateResult => {
  return {
    success: false,
    updatedState: state, // 状態は変更されない
    error,
  };
};
