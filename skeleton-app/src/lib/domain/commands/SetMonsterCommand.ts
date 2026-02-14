/**
 * SetMonsterCommand - モンスターセットコマンド
 *
 * 手札からモンスターカードをセットする Command パターン実装。
 * 召喚権を1消費し、モンスターを裏側守備表示でメインモンスターゾーンに配置する。
 *
 * @module domain/commands/SetMonsterCommand
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { GameCommand } from "$lib/domain/models/GameCommand";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { findCardInstance } from "$lib/domain/models/Zone";
import { successUpdateResult, failureUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { isMonsterCard } from "$lib/domain/models/CardOld";
import { canNormalSummon, executeNormalSummon } from "$lib/domain/rules/SummonRule";
import {
  ValidationErrorCode,
  successValidationResult,
  failureValidationResult,
  validationErrorMessage,
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
      return failureValidationResult(ValidationErrorCode.GAME_OVER);
    }

    // 2. 通常召喚ルールを満たしていること
    const validationResult = canNormalSummon(state);
    if (!validationResult.isValid) {
      return validationResult;
    }

    // 3. 指定カードがモンスターカードであり、手札に存在すること
    const cardInstance = findCardInstance(state.zones, this.cardInstanceId);
    if (!cardInstance) {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_FOUND);
    }
    if (!isMonsterCard(cardInstance)) {
      return failureValidationResult(ValidationErrorCode.NOT_MONSTER_CARD);
    }
    if (cardInstance.location !== "hand") {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_IN_HAND);
    }

    return successValidationResult();
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
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return failureUpdateResult(state, validationErrorMessage(validationResult));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = findCardInstance(state.zones, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedState: GameState = executeNormalSummon(state, this.cardInstanceId, "defense");

    // 3. 戻り値の構築
    return successUpdateResult(updatedState, `Monster set: ${cardInstance.jaName}`);
  }

  /** セット対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
