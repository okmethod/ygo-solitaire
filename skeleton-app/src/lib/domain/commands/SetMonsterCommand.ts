/**
 * SetMonsterCommand - モンスターセットコマンド
 *
 * 手札からモンスターカードをセットする Command パターン実装。
 * 召喚権を1消費し、モンスターを裏側守備表示でメインモンスターゾーンに配置する。
 *
 * @module domain/commands/SetMonsterCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { createSuccessResult, createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { moveCard } from "$lib/domain/models/Zone";
import { canNormalSummon } from "$lib/domain/rules/SummonRule";
import type { CardInstance } from "$lib/domain/models/Card";

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
   * 3. 指定カードが手札に存在し、モンスターカードであること
   */
  canExecute(state: GameState): boolean {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return false;
    }

    // 2. 通常召喚ルールを満たしていること
    const validationResult = canNormalSummon(state);
    if (!validationResult.canExecute) {
      return false;
    }

    // 3. 指定カードがモンスターカードであり、手札に存在すること
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance || cardInstance.type !== "monster" || cardInstance.location !== "hand") {
      return false;
    }

    return true;
  }

  /**
   * 指定カードをセットする
   *
   * 処理フロー:
   * 1. TODO: 要整理
   */
  execute(state: GameState): GameStateUpdateResult {
    // Validate summon rights
    const validationResult = canNormalSummon(state);
    if (!validationResult.canExecute) {
      return createFailureResult(state, validationResult.reason || "Cannot set monster");
    }

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card ${this.cardInstanceId} not found`);
    }

    if (cardInstance.location !== "hand") {
      return createFailureResult(state, "Card not in hand");
    }

    if (cardInstance.type !== "monster") {
      return createFailureResult(state, "Not a monster card");
    }

    // Move card to mainMonsterZone with faceDown position
    const zonesAfterMove = moveCard(state.zones, this.cardInstanceId, "hand", "mainMonsterZone", "faceDown");

    // Update card properties: battlePosition and placedThisTurn
    // moveCard doesn't handle these new fields, so we need to update them manually
    const mainMonsterZone = zonesAfterMove.mainMonsterZone.map((card) =>
      card.instanceId === this.cardInstanceId
        ? ({ ...card, battlePosition: "defense", placedThisTurn: true } as CardInstance)
        : card,
    );

    const newState: GameState = {
      ...state,
      zones: {
        ...zonesAfterMove,
        mainMonsterZone,
      },
      normalSummonUsed: state.normalSummonUsed + 1,
    };

    return createSuccessResult(newState, `Monster set: ${cardInstance.jaName}`);
  }

  /** セット対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
