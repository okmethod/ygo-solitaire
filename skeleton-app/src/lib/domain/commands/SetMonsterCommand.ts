/**
 * SetMonsterCommand - モンスターセットコマンド
 *
 * 手札からモンスターカードをセットする Command パターン実装。
 * 召喚権を1消費し、モンスターを裏側守備表示でメインモンスターゾーンに配置する。
 *
 * @module domain/commands/SetMonsterCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand } from "$lib/domain/models/GameCommand";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { findCardInstance } from "$lib/domain/models/GameState";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { isMonsterCard } from "$lib/domain/models/Card";
import { canNormalSummon, executeNormalSummon } from "$lib/domain/rules/SummonRule";
import {
  ValidationErrorCode,
  validationSuccess,
  validationFailure,
  getValidationErrorMessage,
} from "$lib/domain/models/ValidationResult";

/** モンスターセットコマンドクラス */
export class SetMonsterCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Set monster ${cardInstanceId}`;
  }

  /**
   * 指定カードをセット可能か判定する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * 2. 通常召喚ルールを満たしていること
   * 3. 指定カードがモンスターカードであり、手札に存在すること
   */
  canExecute(state: GameState): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return validationFailure(ValidationErrorCode.GAME_OVER);
    }

    // 2. 通常召喚ルールを満たしていること
    const validationResult = canNormalSummon(state);
    if (!validationResult.canExecute) {
      return validationResult;
    }

    // 3. 指定カードがモンスターカードであり、手札に存在すること
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return validationFailure(ValidationErrorCode.CARD_NOT_FOUND);
    }
    if (!isMonsterCard(cardInstance)) {
      return validationFailure(ValidationErrorCode.NOT_MONSTER_CARD);
    }
    if (cardInstance.location !== "hand") {
      return validationFailure(ValidationErrorCode.CARD_NOT_IN_HAND);
    }

    return validationSuccess();
  }

  /**
   * 指定カードをセットする
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築
   * 3. 戻り値の構築
   */
  execute(state: GameState): GameStateUpdateResult {
    // 1. 実行可能性判定
    const validation = this.canExecute(state);
    if (!validation.canExecute) {
      return createFailureResult(state, getValidationErrorMessage(validation));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = findCardInstance(state, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedState: GameState = executeNormalSummon(state, this.cardInstanceId, "defense");

    // 3. 戻り値の構築
    return {
      success: true,
      updatedState,
      message: `Monster set: ${cardInstance.jaName}`,
    };
  }

  /** セット対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
