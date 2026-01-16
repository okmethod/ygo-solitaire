/**
 * SummonMonsterCommand - モンスター召喚コマンド
 *
 * 手札からモンスターカードを通常召喚する Command パターン実装。
 * 召喚権を1消費し、モンスターを表側攻撃表示でメインモンスターゾーンに配置する。
 *
 * @module application/commands/SummonMonsterCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { CardInstance } from "$lib/domain/models/Card";
import { findCardInstance } from "$lib/domain/models/GameState";
import { createSuccessResult, createFailureResult } from "$lib/domain/models/GameStateUpdate";
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
   * 3. 指定カードが手札に存在し、モンスターカードであること
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
   * 1. TODO: 要整理
   */
  execute(state: GameState): GameStateUpdateResult {
    const validation = this.canExecute(state);
    if (!validation.canExecute) {
      return createFailureResult(state, getValidationErrorMessage(validation));
    }

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card ${this.cardInstanceId} not found`);
    }

    // Move card to mainMonsterZone with faceUp position
    const zonesAfterMove = moveCard(state.zones, this.cardInstanceId, "hand", "mainMonsterZone", "faceUp");

    // Update card properties: battlePosition and placedThisTurn
    // moveCard doesn't handle these new fields, so we need to update them manually
    const mainMonsterZone = zonesAfterMove.mainMonsterZone.map((card) =>
      card.instanceId === this.cardInstanceId
        ? ({ ...card, battlePosition: "attack", placedThisTurn: true } as CardInstance)
        : card,
    );

    const updatedState: GameState = {
      ...state,
      zones: {
        ...zonesAfterMove,
        mainMonsterZone,
      },
      normalSummonUsed: state.normalSummonUsed + 1,
    };

    return createSuccessResult(updatedState, `Monster summoned: ${cardInstance.jaName}`);
  }

  /** 召喚対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
