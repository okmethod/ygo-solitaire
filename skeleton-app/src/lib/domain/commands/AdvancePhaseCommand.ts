/**
 * AdvancePhaseCommand - フェイズ遷移コマンド
 *
 * 現在のフェイズから次のフェイズに遷移する Command パターン実装。
 * エンドフェイズ遷移時には、ターン1制限のリセットや、保留されたエンドフェイズ時効果の解決を行う。
 *
 * @module domain/commands/AdvancePhaseCommand
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { GameCommand } from "$lib/domain/models/GameCommand";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { CardInstance, StateOnField } from "$lib/domain/models/CardOld";
import type { Zones } from "$lib/domain/models/Zone";
import { successUpdateResult, failureUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { getNextPhase, validatePhaseTransition, getPhaseDisplayName, isEndPhase } from "$lib/domain/models/Phase";
import {
  ValidationErrorCode,
  successValidationResult,
  failureValidationResult,
  validationErrorMessage,
} from "$lib/domain/models/ValidationResult";

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
  canExecute(state: GameState): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return failureValidationResult(ValidationErrorCode.GAME_OVER);
    }

    const nextPhase = getNextPhase(state.phase);

    // 2. フェイズ遷移が許可されていること
    const validation = validatePhaseTransition(state.phase, nextPhase);
    if (!validation.valid) {
      return failureValidationResult(ValidationErrorCode.PHASE_TRANSITION_NOT_ALLOWED);
    }

    return successValidationResult();
  }

  /**
   * フェイズ遷移する
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築
   * 3. 戻り値の構築
   *
   * Note: 効果処理は、Application 層に返された後に実行される
   */
  execute(state: GameState): GameStateUpdateResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return failureUpdateResult(state, validationErrorMessage(validationResult));
    }

    const nextPhase = getNextPhase(state.phase);
    const hasPendingEffects = isEndPhase(nextPhase) && state.pendingEndPhaseEffects.length > 0;

    // エンドフェイズ移行時にフィールドカードの activatedEffects をリセット
    const updatedZones: Zones = isEndPhase(nextPhase) ? this.resetFieldCardActivatedEffects(state.zones) : state.zones;

    // 2. 更新後状態の構築
    const updatedState: GameState = {
      ...state,
      zones: updatedZones,
      phase: nextPhase,
      // ターン終了時に「名称ターン1制限」をリセット
      activatedOncePerTurnCards: isEndPhase(nextPhase) ? new Set<number>() : state.activatedOncePerTurnCards,
      // 保留リストは、エンドフェイズに遷移した時点でクリアする
      pendingEndPhaseEffects: hasPendingEffects ? [] : state.pendingEndPhaseEffects,
    };

    // 3. 戻り値の構築
    return successUpdateResult(
      updatedState,
      `Advanced to ${getPhaseDisplayName(nextPhase)}`,
      // 効果がある場合のみ、解決ステップを配列として付与する
      hasPendingEffects ? [...state.pendingEndPhaseEffects] : undefined,
    );
  }

  /** 次のフェイズ名を取得する */
  getNextPhase(state: GameState): string {
    return getNextPhase(state.phase);
  }

  /**
   * フィールドカードの activatedEffects をリセットする
   * エンドフェイズ移行時に呼び出され、1ターンに1度制限をリセットする
   */
  private resetFieldCardActivatedEffects(zones: Zones): Zones {
    const resetCard = (card: CardInstance): CardInstance => {
      if (!card.stateOnField) return card;
      if (card.stateOnField.activatedEffects.size === 0) return card;

      const resetStateOnField: StateOnField = {
        ...card.stateOnField,
        activatedEffects: new Set(),
      };
      return { ...card, stateOnField: resetStateOnField };
    };

    return {
      ...zones,
      mainMonsterZone: zones.mainMonsterZone.map(resetCard),
      spellTrapZone: zones.spellTrapZone.map(resetCard),
      fieldZone: zones.fieldZone.map(resetCard),
    };
  }
}
