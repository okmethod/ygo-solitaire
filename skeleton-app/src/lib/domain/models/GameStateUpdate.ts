/**
 * GameStateUpdate - GameState更新モデルの型とインターフェース
 *
 * @module domain/models/GameStateUpdate
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { EffectResolutionStep } from "$lib/domain/models/EffectResolutionStep";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";

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
   * 効果解決ステップ（オプショナル）
   *
   * Domain層がApplication層に効果解決を委譲する際に使用。
   * - ActivateSpellCommand.execute() が effectSteps を返す
   * - GameFacade.activateSpell() が effectResolutionStore.startResolution() を呼ぶ
   *
   * これにより、Domain層がApplication層の制御フローに依存しない設計を実現。
   */
  readonly effectSteps?: EffectResolutionStep[];
}

/**
 * GameCommand - Command Patternの基底インターフェース
 *
 * プレイヤーアクションをオブジェクトとしてカプセル化。
 * - Undo/Redo機能（将来対応）
 * - アクション履歴/リプレイ（将来対応）
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
