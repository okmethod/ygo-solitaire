/**
 * GameStateUpdate - GameState更新モデルの型とインターフェース
 *
 * @module domain/models/GameStateUpdate
 */

import type { GameState } from "./GameState";
import type { EffectResolutionStep } from "./EffectResolutionStep";

/**
 * GameState更新結果の共通インターフェース
 *
 * すべてのゲーム状態更新操作（Command、Effect、Rule等）が返す統一結果型。
 *
 * Used by:
 * - GameCommand.execute() の戻り値
 * - EffectResolutionStep.action() の戻り値
 * - その他のDomain層の状態更新処理
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
 * GameCommand - Command Patternの基底インターフェース
 *
 * プレイヤーアクションをオブジェクトとしてカプセル化。
 * - Undo/Redo機能（将来対応）
 * - アクション履歴/リプレイ（将来対応）
 * - テスト可能なゲームロジック
 * - 関心の分離
 *
 * Commandは以下のパターンに従う:
 * 1. canExecute() - 事前検証（状態を変更せずルールチェック）
 * 2. execute() - 新しいGameStateを返す（不変性を維持）
 * 3. description - 人間が読める操作名（ログ/履歴用）
 */
export interface GameCommand {
  /**
   * Commandの説明（ログ/履歴用）
   * 例: "Draw 2 cards", "Advance to Main Phase"
   */
  readonly description: string;

  /**
   * 状態を変更せずにCommand実行可能かをチェック
   *
   * @param state - 現在のゲーム状態
   * @returns 実行可能ならtrue、そうでなければfalse
   */
  canExecute(state: GameState): boolean;

  /**
   * Commandを実行して新しいゲーム状態を返す
   *
   * @param state - 現在のゲーム状態
   * @returns 更新結果（新しい状態、メッセージ、効果ステップ等）
   */
  execute(state: GameState): GameStateUpdateResult;
}

/** 成功した GameStateUpdateResult を作成するヘルパー */
export function createSuccessResult(newState: GameState, message?: string): GameStateUpdateResult {
  return {
    success: true,
    newState, // TODO: UpdatedState にリネームしたい
    message,
  };
}

/** 失敗した GameStateUpdateResult を作成するヘルパー */
export function createFailureResult(state: GameState, error: string): GameStateUpdateResult {
  return {
    success: false,
    newState: state, // 状態は変更されない
    error,
  };
}
