/**
 * SetSpellTrapCommand - 魔法・罠セットコマンド
 *
 * 手札から魔法・罠カードをセットする Command パターン実装。
 *
 * @module domain/commands/SetSpellTrapCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { createSuccessResult, createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { moveCard, sendToGraveyard } from "$lib/domain/models/Zone";
import type { CardInstance } from "$lib/domain/models/Card";

/** 魔法・罠セットコマンドクラス */
export class SetSpellTrapCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Set spell/trap ${cardInstanceId}`;
  }

  /**
   * 指定カードをセット可能か判定する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * 2. メインフェイズ1であること
   * 3. 指定カードが手札に存在し、魔法カードまたは罠カードであること
   * 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
   */
  canExecute(state: GameState): boolean {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return false;
    }

    // 2. メインフェイズ1であること
    if (state.phase !== "Main1") {
      return false;
    }

    // 3. 指定カードが手札に存在し、魔法カードまたは罠カードであること
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance || cardInstance.location !== "hand") {
      return false;
    }
    if (cardInstance.type !== "spell" && cardInstance.type !== "trap") {
      return false;
    }

    // 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
    if (cardInstance.spellType !== "field" && state.zones.spellTrapZone.length >= 5) {
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
    if (state.phase !== "Main1") {
      return createFailureResult(state, "Main1フェーズではありません");
    }

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card ${this.cardInstanceId} not found`);
    }

    if (cardInstance.location !== "hand") {
      return createFailureResult(state, "Card not in hand");
    }

    if (cardInstance.type !== "spell" && cardInstance.type !== "trap") {
      return createFailureResult(state, "Not a spell or trap card");
    }

    const isFieldSpell = cardInstance.spellType === "field";
    let zones = state.zones;

    // Check zone capacity for non-field spells/traps
    if (!isFieldSpell && zones.spellTrapZone.length >= 5) {
      return createFailureResult(state, "魔法・罠ゾーンが満杯です");
    }

    // If field spell and fieldZone occupied, send existing to graveyard
    if (isFieldSpell && zones.fieldZone.length > 0) {
      const existingCard = zones.fieldZone[0];
      zones = sendToGraveyard(zones, existingCard.instanceId);
    }

    // Determine target zone
    const targetZone = isFieldSpell ? "fieldZone" : "spellTrapZone";

    // Move card to target zone with faceDown position
    zones = moveCard(zones, this.cardInstanceId, "hand", targetZone, "faceDown");

    // Update placedThisTurn flag
    const updatedZone = zones[targetZone].map((card) =>
      card.instanceId === this.cardInstanceId ? ({ ...card, placedThisTurn: true } as CardInstance) : card,
    );

    const newState: GameState = {
      ...state,
      zones: {
        ...zones,
        [targetZone]: updatedZone,
      },
      // NOTE: Setting spell/trap does NOT consume normalSummonUsed
    };

    return createSuccessResult(newState, `Card set: ${cardInstance.jaName}`);
  }

  /** セット対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
