/**
 * GameCommand - ゲーム操作コマンドモデル
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { GameStateUpdateResult, ValidationResult, AtomicStep } from "$lib/domain/models/GameProcessing";

/**
 * ゲーム操作コマンドの実行結果
 */
export interface GameCommandResult extends GameStateUpdateResult {
  /**
   * 効果処理ステップ
   *
   * Domain層がApplication層に効果処理を委譲する際に使用。
   * - ActivateSpellCommand.execute() が effectSteps を返す
   * - GameFacade.activateSpell() が effectQueueStore.startProcessing() を呼ぶ
   *
   * これにより、Domain層がApplication層の制御フローに依存しない設計を実現。
   */
  readonly effectSteps: AtomicStep[];
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
