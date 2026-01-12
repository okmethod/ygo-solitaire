/**
 * ShuffleDeckCommand - デッキシャッフルコマンド
 *
 * デッキをシャッフルし、ランダムな順序に並び替える Command パターン実装。
 *
 * @module application/commands/ShuffleDeckCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { shuffleArray } from "$lib/shared/utils/arrayUtils";

/** デッキシャッフルコマンドクラス */
export class ShuffleDeckCommand implements GameCommand {
  readonly description: string;

  constructor() {
    this.description = "Shuffle deck";
  }

  /**
   * デッキをシャッフル可能か判定する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * （デッキが空でも実行可能）
   */
  canExecute(state: GameState): boolean {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return false;
    }

    return true;
  }

  /**
   * デッキをシャッフルする
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築
   * 3. 戻り値の構築
   */
  execute(state: GameState): GameStateUpdateResult {
    // 1. 実行可能性判定
    if (!this.canExecute(state)) {
      return createFailureResult(state, `Cannot shuffle deck because the game is over.`);
    }

    // 2. 更新後状態の構築
    const updatedState: GameState = {
      ...state,
      zones: {
        ...state.zones,
        deck: shuffleArray(state.zones.deck),
      },
    };

    // 3. 戻り値の構築
    return {
      success: true,
      newState: updatedState,
      message: "Shuffled the deck",
    };
  }
}
