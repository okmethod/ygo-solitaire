/**
 * AdvancePhaseCommand - フェイズ遷移コマンド
 *
 * 現在のフェイズから次のフェイズに遷移する Command パターン実装。
 * エンドフェイズ遷移時には、ターン1制限のリセットや、保留されたエンドフェイズ時効果の解決を行う。
 *
 * @module domain/commands/AdvancePhaseCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { getNextValidPhase, validatePhaseTransition, getPhaseDisplayName } from "$lib/domain/rules/PhaseRule";

/** フェイズ遷移コマンドクラス */
export class AdvancePhaseCommand implements GameCommand {
  readonly description: string;

  constructor() {
    this.description = "Advance to next phase";
  }

  /**
   * フェイズ遷移可能か判定する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * 2. フェイズ遷移が許可されていること
   */
  canExecute(state: GameState): boolean {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return false;
    }

    const nextPhase = getNextValidPhase(state.phase);

    // 2. フェイズ遷移が許可されていること
    const validation = validatePhaseTransition(state.phase, nextPhase);
    if (!validation.valid) {
      return false;
    }

    return true;
  }

  /**
   * フェイズ遷移を実行する
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築
   * 3. 戻り値の構築
   *
   * Note: 効果処理ステップは、Application 層に返された後に逐次実行される。
   */
  execute(state: GameState): GameStateUpdateResult {
    // 1. 実行可能性判定
    if (!this.canExecute(state)) {
      return createFailureResult(state, `Cannot advance from ${state.phase} phase`);
    }

    const nextPhase = getNextValidPhase(state.phase);
    const isAdvancingToEnd = nextPhase === "End";
    const hasPendingEffects = isAdvancingToEnd && state.pendingEndPhaseEffects.length > 0;

    // 2. 更新後状態の構築
    const updatedState: GameState = {
      ...state,
      phase: nextPhase,
      // ターン終了時に「ターン1制限」「名称ターン1制限」をリセット
      activatedIgnitionEffectsThisTurn: isAdvancingToEnd ? new Set<string>() : state.activatedIgnitionEffectsThisTurn,
      activatedOncePerTurnCards: isAdvancingToEnd ? new Set<number>() : state.activatedOncePerTurnCards,
      // 保留リストは、エンドフェイズに遷移した時点でクリアする
      pendingEndPhaseEffects: hasPendingEffects ? [] : state.pendingEndPhaseEffects,
    };

    // 3. 戻り値の構築
    return {
      success: true,
      newState: updatedState,
      message: `Advanced to ${getPhaseDisplayName(nextPhase)}`,
      // 効果がある場合のみ、解決ステップを配列として付与する
      ...(hasPendingEffects && { effectSteps: [...state.pendingEndPhaseEffects] }),
    };
  }

  /** 次のフェイズ名を取得する */
  getNextPhase(state: GameState): string {
    return getNextValidPhase(state.phase);
  }
}
