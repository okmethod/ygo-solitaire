/**
 * DrawCardCommand - カードドローコマンド
 *
 * デッキからカードをドローする Command パターン実装。
 *
 * @module application/commands/DrawCardCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { drawCards } from "$lib/domain/models/Zone";

/** カードドローコマンドクラス */
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
  canExecute(state: GameState): boolean {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return false;
    }

    // 2. デッキに十分な枚数のカードが存在すること
    if (state.zones.deck.length < this.count) {
      return false;
    }

    return true;
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
    if (!this.canExecute(state)) {
      return createFailureResult(
        state,
        `Cannot draw ${this.count} cards. Only ${state.zones.deck.length} cards in deck.`,
      );
    }

    // 2. 更新後状態の構築
    const updatedState: GameState = {
      ...state,
      zones: drawCards(state.zones, this.count),
    };

    // 3. 戻り値の構築
    return {
      success: true,
      newState: updatedState,
      message: `Draw ${this.count} card${this.count > 1 ? "s" : ""}`,
    };
  }

  /** ドローするカード枚数を取得する */
  getCount(): number {
    return this.count;
  }
}
