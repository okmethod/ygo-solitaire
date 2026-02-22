/**
 * GameCommand - ゲーム操作コマンドモデル
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { GameStateUpdateResult, ValidationResult, AtomicStep, GameEvent } from "$lib/domain/models/GameProcessing";
import type { ChainBlockParams } from "$lib/domain/models/Chain";
import { GameState } from "$lib/domain/models/GameState";

/**
 * ゲーム操作コマンドの実行結果
 */
export interface GameCommandResult extends GameStateUpdateResult {
  /**
   * 効果処理ステップ（activationSteps）
   *
   * ドメイン層がアプリ層に効果処理を委譲する際に使用。
   * - ActivateSpellCommand.execute() が effectSteps を返す
   * - GameFacade.activateSpell() が effectQueueStore.startProcessing() を呼ぶ
   *
   * Note: チェーンシステム実装後は、発動時処理（activationSteps）のみを含む。
   * 解決時処理（resolutionSteps）は chainBlock に含まれる。
   * フェーズ3でチェーンシステムを実装後、GameFacade 側で発動時処理と解決時処理を分離したのち、
   * activationSteps にリネームする
   */
  readonly effectSteps: AtomicStep[];

  /**
   * チェーンブロック情報（チェーンブロックを作る処理の場合）
   *
   * カードの発動・効果の発動など、チェーンブロックを作る処理の場合に設定。
   * - chainStackStore.pushChainBlock() で使用される
   * - resolutionSteps はチェーン解決時に処理される
   *
   * チェーンブロックを作らない処理（召喚、セット等）の場合は undefined。
   */
  readonly chainBlock?: ChainBlockParams;
}

/**
 * ゲーム操作コマンド
 *
 * プレイヤーによるゲーム操作をオブジェクトとしてカプセル化。
 * - ゲーム操作履歴/リプレイ（将来対応）
 * - Undo/Redo機能（将来対応）
 * - テスト可能なゲームロジック
 * - 関心の分離
 */
export interface GameCommand {
  /** Commandの説明（ログ/履歴用）*/
  readonly description: string;

  /** 状態を変更せずにCommand実行可能かをチェックする */
  canExecute(state: GameSnapshot): ValidationResult;

  /** Commandを実行して更新後のゲーム状態を返す */
  execute(state: GameSnapshot): GameCommandResult;
}

/** 成功した GameCommandResult */
export const successCommandResult = (
  updatedState: GameSnapshot,
  message?: string,
  emittedEvents?: GameEvent[],
  effectSteps?: AtomicStep[],
  chainBlock?: ChainBlockParams,
): GameCommandResult => {
  // 開発時のみ
  if (import.meta.env.DEBUG) {
    GameState.assert(updatedState);
  }

  // 勝利条件判定
  const checkedState = GameState.checkVictory(updatedState);

  return {
    success: true,
    updatedState: checkedState,
    message,
    emittedEvents,
    effectSteps: effectSteps ?? [],
    chainBlock,
  };
};

/** 失敗した GameCommandResult */
export const failureCommandResult = (state: GameSnapshot, error: string): GameCommandResult => {
  return {
    success: false,
    updatedState: state, // 状態は変更されない
    error,
    effectSteps: [],
  };
};
