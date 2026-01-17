/**
 * DiscardCardsCommand - カード破棄コマンド
 *
 * 手札から複数のカードを墓地に捨てる Command パターン実装。
 * TODO: DrawCard と DiscardCards で単数形・複数形の扱いが異なるので統一したい
 *
 * @module domain/commands/DiscardCardsCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { discardCards } from "$lib/domain/models/Zone";
import {
  ValidationErrorCode,
  validationSuccess,
  validationFailure,
  getValidationErrorMessage,
} from "$lib/domain/models/ValidationResult";

/** カード破棄コマンドクラス */
export class DiscardCardsCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly instanceIds: string[]) {
    this.description = `Discard ${instanceIds.length} card${instanceIds.length > 1 ? "s" : ""}`;
  }

  /**
   * 指定カード群を破棄可能か判定する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * 2. 指定カードがすべて手札に存在すること
   */
  canExecute(state: GameState): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return validationFailure(ValidationErrorCode.GAME_OVER);
    }

    // 2. 指定カードがすべて手札に存在すること
    if (!this.instanceIds.every((id) => state.zones.hand.some((c) => c.instanceId === id))) {
      return validationFailure(ValidationErrorCode.CARD_NOT_IN_HAND);
    }

    return validationSuccess();
  }

  /**
   * 指定カード群を破棄する
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

    // 2. 更新後状態の構築
    const updatedState: GameState = {
      ...state,
      zones: discardCards(state.zones, this.instanceIds),
    };

    // 3. 戻り値の構築
    return {
      success: true,
      updatedState: updatedState,
      message: `Discarded ${this.instanceIds.length} card${this.instanceIds.length > 1 ? "s" : ""}`,
    };
  }

  /** 破棄するカードのインスタンスID群を取得する */
  getInstanceIds(): string[] {
    return [...this.instanceIds];
  }
}
