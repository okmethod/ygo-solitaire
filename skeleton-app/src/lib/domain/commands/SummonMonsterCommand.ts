/**
 * SummonMonsterCommand - モンスター召喚コマンド
 *
 * 手札からモンスターカードを通常召喚する Command パターン実装。
 * 召喚権を1消費し、モンスターを表側攻撃表示でメインモンスターゾーンに配置する。
 *
 * @module domain/commands/SummonMonsterCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { CardInstance } from "$lib/domain/models/Card";
import type { Zones } from "$lib/domain/models/Zone";
import { findCardInstance } from "$lib/domain/models/GameState";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { moveCard } from "$lib/domain/models/Zone";
import { canNormalSummon } from "$lib/domain/rules/SummonRule";
import {
  ValidationErrorCode,
  validationSuccess,
  validationFailure,
  getValidationErrorMessage,
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
    if (cardInstance.type !== "monster") {
      return validationFailure(ValidationErrorCode.NOT_MONSTER_CARD);
    }
    if (cardInstance.location !== "hand") {
      return validationFailure(ValidationErrorCode.CARD_NOT_IN_HAND);
    }

    return validationSuccess();
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
      return createFailureResult(state, getValidationErrorMessage(validation));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = findCardInstance(state, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedState: GameState = {
      ...state,
      zones: this.moveSummonedMonsterCard(state.zones, cardInstance),
      // 召喚権を1消費
      normalSummonUsed: state.normalSummonUsed + 1,
    };

    // 3. 戻り値の構築
    return {
      success: true,
      updatedState,
      message: `Monster summoned: ${cardInstance.jaName}`,
      // TODO: 召喚成功時に誘発する効果があればここに追加
    };
  }

  // 召喚するモンスターカードをメインモンスターゾーンに表側攻撃表示で配置する
  private moveSummonedMonsterCard(zones: Zones, cardInstance: CardInstance): Zones {
    return moveCard(zones, cardInstance.instanceId, "hand", "mainMonsterZone", {
      position: "faceUp",
      battlePosition: "attack",
      placedThisTurn: true,
    });
  }

  /** 召喚対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
