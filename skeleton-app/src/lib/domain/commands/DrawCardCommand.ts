/**
 * DrawCardCommand - カードドローコマンド
 *
 * デッキからカードをドローする Command パターン実装。
 *
 * @deprecated このコマンドはプレイヤーアクションとして使用されません。
 * カード効果によるドロー処理は stepBuilders.ts の createDrawStep() を使用してください。
 * GameCommand はプレイヤーが直接トリガーする操作のみを対象とします。
 *
 * @module domain/commands/DrawCardCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand } from "$lib/domain/models/GameCommand";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { drawCards } from "$lib/domain/models/Zone";
import {
  ValidationErrorCode,
  validationSuccess,
  validationFailure,
  getValidationErrorMessage,
} from "$lib/domain/models/ValidationResult";

/**
 * カードドローコマンドクラス
 * @deprecated プレイヤーアクションではないため非推奨。createDrawStep() を使用してください。
 */
export class DrawCardCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly count: number = 1) {
    this.description = `Draw ${count} card${count > 1 ? "s" : ""}`;
  }

  /**
   * 指定枚数のカードをドローが可能か判定する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * 2. デッキに十分な枚数のカードが存在すること
   */
  canExecute(state: GameState): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return validationFailure(ValidationErrorCode.GAME_OVER);
    }

    // 2. デッキに十分な枚数のカードが存在すること
    if (state.zones.deck.length < this.count) {
      return validationFailure(ValidationErrorCode.INSUFFICIENT_DECK, {
        required: this.count,
        actual: state.zones.deck.length,
      });
    }

    return validationSuccess();
  }

  /**
   * 指定枚数のカードをドローする
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
      zones: drawCards(state.zones, this.count),
    };

    // 3. 戻り値の構築
    return {
      success: true,
      updatedState,
      message: `Draw ${this.count} card${this.count > 1 ? "s" : ""}`,
    };
  }

  /** ドローするカード枚数を取得する */
  getCount(): number {
    return this.count;
  }
}
