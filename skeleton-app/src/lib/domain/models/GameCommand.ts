/**
 * GameCommand - ゲーム操作の基底インターフェース
 *
 * @module domain/models/GameCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";

/**
 * GameCommand - Command Patternの基底インターフェース
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
  canExecute(state: GameState): ValidationResult;

  /* Commandを実行して更新後のゲーム状態を返す */
  execute(state: GameState): GameStateUpdateResult;
}
