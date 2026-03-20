/**
 * SynchroSummonCommand - シンクロ召喚コマンド
 *
 * EXデッキからシンクロモンスターを特殊召喚する Command パターン実装。
 * フィールドのチューナー + 非チューナーを素材として墓地へ送り、
 * レベル合計が一致するシンクロモンスターを召喚する。
 *
 * @module domain/commands/SynchroSummonCommand
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import type { GameCommand, GameCommandResult } from "$lib/domain/models/Command";
import { Command } from "$lib/domain/models/Command";
import { canSynchroSummon, performSynchroSummon } from "$lib/domain/rules/SummonRule";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/** シンクロ召喚コマンドクラス */
export class SynchroSummonCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Synchro Summon ${cardInstanceId}`;
  }

  /**
   * 指定カードをシンクロ召喚可能か判定する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * 2. シンクロ召喚ルールを満たしていること
   */
  canExecute(state: GameSnapshot): ValidationResult {
    if (state.result.isGameOver) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.GAME_OVER);
    }
    return canSynchroSummon(state, this.cardInstanceId);
  }

  /**
   * シンクロ召喚を実行する
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 素材選択ステップを返す（実際の召喚は選択完了後）
   */
  execute(state: GameSnapshot): GameCommandResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return Command.Result.failure(state, GameProcessing.Validation.errorMessage(validationResult));
    }

    // 2. シンクロ召喚処理（素材選択ステップを返す）
    const result = performSynchroSummon(state, this.cardInstanceId);
    // 状態は素材選択完了後に更新されるため、現状態を返す
    return Command.Result.success(state, result.message, undefined, [result.step]);
  }

  /** シンクロ召喚対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
