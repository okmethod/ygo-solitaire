/**
 * SummonMonsterCommand - モンスター召喚コマンド
 *
 * 手札からモンスターカードを通常召喚する Command パターン実装。
 * 召喚権を1消費し、モンスターを表側攻撃表示でメインモンスターゾーンに配置する。
 *
 * @module application/commands/SummonMonsterCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { createSuccessResult, createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { moveCard } from "$lib/domain/models/Zone";
import { canNormalSummon } from "$lib/domain/rules/SummonRule";
import type { CardInstance } from "$lib/domain/models/Card";

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
  canExecute(state: GameState): boolean {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return false;
    }

    // 2. 通常召喚ルールを満たしていること
    const validation = canNormalSummon(state);
    if (!validation.canSummon) {
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
   * 指定カードを通常召喚する
   *
   * 処理フロー:
   * 1. TODO: 要整理
   */
  execute(state: GameState): GameStateUpdateResult {
    const validation = canNormalSummon(state);
    if (!validation.canSummon) {
      return createFailureResult(state, validation.reason || "Cannot summon");
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

    // Move card to mainMonsterZone with faceUp position
    const zonesAfterMove = moveCard(state.zones, this.cardInstanceId, "hand", "mainMonsterZone", "faceUp");

    // Update card properties: battlePosition and placedThisTurn
    // moveCard doesn't handle these new fields, so we need to update them manually
    const mainMonsterZone = zonesAfterMove.mainMonsterZone.map((card) =>
      card.instanceId === this.cardInstanceId
        ? ({ ...card, battlePosition: "attack", placedThisTurn: true } as CardInstance)
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

    return createSuccessResult(newState, `Monster summoned: ${cardInstance.jaName}`);
  }

  /** 召喚対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
