/**
 * SetSpellTrapCommand - 魔法・罠セットコマンド
 *
 * 手札から魔法・罠カードをセットする Command パターン実装。
 *
 * @module domain/commands/SetSpellTrapCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand } from "$lib/domain/models/GameCommand";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { CardInstance } from "$lib/domain/models/Card";
import type { Zones } from "$lib/domain/models/Zone";
import { findCardInstance } from "$lib/domain/models/GameState";
import { successUpdateResult, failureUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { isSpellCard, isTrapCard, isFieldSpellCard } from "$lib/domain/models/Card";
import { moveCard, sendToGraveyard, isSpellTrapZoneFull, isFieldZoneFull } from "$lib/domain/models/Zone";
import { isMainPhase } from "$lib/domain/models/Phase";
import {
  ValidationErrorCode,
  validationSuccess,
  validationFailure,
  getValidationErrorMessage,
} from "$lib/domain/models/ValidationResult";

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
   * 2. メインフェイズであること
   * 3. 指定カードが手札に存在し、魔法カードまたは罠カードであること
   * 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
   */
  canExecute(state: GameState): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return validationFailure(ValidationErrorCode.GAME_OVER);
    }

    // 2. メインフェイズであること
    if (!isMainPhase(state.phase)) {
      return validationFailure(ValidationErrorCode.NOT_MAIN_PHASE);
    }

    // 3. 指定カードが手札に存在し、魔法カードまたは罠カードであること
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return validationFailure(ValidationErrorCode.CARD_NOT_FOUND);
    }
    if (cardInstance.location !== "hand") {
      return validationFailure(ValidationErrorCode.CARD_NOT_IN_HAND);
    }
    if (!isSpellCard(cardInstance) && !isTrapCard(cardInstance)) {
      return validationFailure(ValidationErrorCode.NOT_SPELL_OR_TRAP_CARD);
    }

    // 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
    if (!isFieldSpellCard(cardInstance) && isSpellTrapZoneFull(state.zones)) {
      return validationFailure(ValidationErrorCode.SPELL_TRAP_ZONE_FULL);
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
      return failureUpdateResult(state, getValidationErrorMessage(validation));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = findCardInstance(state, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedState: GameState = {
      ...state,
      zones: this.moveSetSpellTrapCard(state.zones, cardInstance),
    };

    // 3. 戻り値の構築
    return successUpdateResult(updatedState, `Card set: ${cardInstance.jaName}`);
  }

  // セットする魔法・罠カードを適切なゾーンに裏向きで配置する
  private moveSetSpellTrapCard(zones: Zones, cardInstance: CardInstance): Zones {
    const setCardState: Partial<CardInstance> = {
      position: "faceDown",
      placedThisTurn: true,
    };

    // フィールド魔法カードの場合
    if (isFieldSpellCard(cardInstance)) {
      // 既存フィールド魔法カードが存在する場合、先に墓地へ送る
      if (isFieldZoneFull(zones)) {
        zones = sendToGraveyard(zones, zones.fieldZone[0].instanceId);
      }
      return moveCard(zones, this.cardInstanceId, "hand", "fieldZone", setCardState);
    }

    return moveCard(zones, this.cardInstanceId, "hand", "spellTrapZone", setCardState);
  }

  /** セット対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
