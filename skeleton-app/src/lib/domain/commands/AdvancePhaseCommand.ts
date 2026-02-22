/**
 * AdvancePhaseCommand - フェイズ遷移コマンド
 *
 * 現在のフェイズから次のフェイズに遷移する Command パターン実装。
 * エンドフェイズ遷移時には、ターン1制限のリセットや、保留されたエンドフェイズ時効果の解決を行う。
 *
 * @module domain/commands/AdvancePhaseCommand
 */

import type { CardInstance, StateOnField } from "$lib/domain/models/Card";
import type { GameSnapshot, CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { GameCommand, GameCommandResult } from "$lib/domain/models/Command";
import { Command } from "$lib/domain/models/Command";

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
  canExecute(state: GameSnapshot): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.GAME_OVER);
    }

    const nextPhase = GameState.Phase.next(state.phase);

    // 2. フェイズ遷移が許可されていること
    const validation = GameState.Phase.changeable(state.phase, nextPhase);
    if (!validation.valid) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.PHASE_TRANSITION_NOT_ALLOWED);
    }

    return GameProcessing.Validation.success();
  }

  /**
   * フェイズ遷移する
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築
   * 3. 戻り値の構築
   *
   * Note: 効果処理は、アプリ層に返された後に実行される
   */
  execute(state: GameSnapshot): GameCommandResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return Command.Result.failure(state, GameProcessing.Validation.errorMessage(validationResult));
    }

    const nextPhase = GameState.Phase.next(state.phase);
    const hasPendingEffects = GameState.Phase.isEnd(nextPhase) && state.queuedEndPhaseEffectIds.length > 0;

    // エンドフェイズ移行時にフィールドカードの activatedEffects をリセット
    const updatedSpace: CardSpace = GameState.Phase.isEnd(nextPhase)
      ? this.resetFieldCardActivatedEffects(state.space)
      : state.space;

    // 2. 更新後状態の構築
    const updatedState: GameSnapshot = {
      ...state,
      space: updatedSpace,
      phase: nextPhase,
      // ターン終了時に「名称ターン1制限」をリセット
      activatedCardIds: GameState.Phase.isEnd(nextPhase) ? new Set<number>() : state.activatedCardIds,
      // 保留リストは、エンドフェイズに遷移した時点でクリアする
      queuedEndPhaseEffectIds: hasPendingEffects ? [] : state.queuedEndPhaseEffectIds,
    };

    // 3. 戻り値の構築
    // TODO: エンドフェイズ効果の解決ステップを生成する必要がある
    return Command.Result.success(
      updatedState,
      `Advanced to ${GameState.Phase.displayName(nextPhase)}`,
      // 効果がある場合のみ、解決ステップを配列として付与する
      // hasPendingEffects ? [...state.queuedEndPhaseEffectIds] : undefined,
    );
  }

  /** 次のフェイズ名を取得する */
  getNextPhase(state: GameSnapshot): string {
    return GameState.Phase.next(state.phase);
  }

  /**
   * フィールドカードの activatedEffects をリセットする
   * エンドフェイズ移行時に呼び出され、1ターンに1度制限をリセットする
   */
  private resetFieldCardActivatedEffects(space: CardSpace): CardSpace {
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
      ...space,
      mainMonsterZone: space.mainMonsterZone.map(resetCard),
      spellTrapZone: space.spellTrapZone.map(resetCard),
      fieldZone: space.fieldZone.map(resetCard),
    };
  }
}
