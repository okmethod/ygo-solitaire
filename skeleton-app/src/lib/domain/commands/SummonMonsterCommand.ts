/**
 * SummonMonsterCommand - モンスター召喚コマンド
 *
 * 手札からモンスターカードを通常召喚する Command パターン実装。
 * 召喚権を1消費し、モンスターを表側攻撃表示でメインモンスターゾーンに配置する。
 *
 * @module domain/commands/SummonMonsterCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand } from "$lib/domain/models/GameCommand";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { findCardInstance } from "$lib/domain/models/Zone";
import { successUpdateResult, failureUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { isMonsterCard } from "$lib/domain/models/Card";
import { canNormalSummon, executeNormalSummon } from "$lib/domain/rules/SummonRule";
import {
  ValidationErrorCode,
  successValidationResult,
  failureValidationResult,
  validationErrorMessage,
} from "$lib/domain/models/ValidationResult";

/** モンスター通常召喚コマンドクラス */
export class SummonMonsterCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Summon monster ${cardInstanceId}`;
  }

  /**
   * 指定カードを通常召喚可能か判定する
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
    if (!validationResult.canExecute) {
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
   * 指定カードを通常召喚する
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
      return failureUpdateResult(state, validationErrorMessage(validation));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = findCardInstance(state.zones, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedState: GameState = executeNormalSummon(state, this.cardInstanceId, "attack");

    // 3. 戻り値の構築
    return successUpdateResult(
      updatedState,
      `Monster summoned: ${cardInstance.jaName}`,
      // TODO: 召喚成功時に誘発する効果があればここに追加
    );
  }

  /** 召喚対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
