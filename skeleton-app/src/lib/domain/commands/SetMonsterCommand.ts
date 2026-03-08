/**
 * SetMonsterCommand - モンスターセットコマンド
 *
 * 手札からモンスターカードをセットする Command パターン実装。
 * 召喚権を1消費し、モンスターを裏側守備表示でメインモンスターゾーンに配置する。
 * アドバンスセット: レベルに応じて、必要な場合はリリース選択ステップを返す。
 *
 * @module domain/commands/SetMonsterCommand
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import type { GameCommand, GameCommandResult } from "$lib/domain/models/Command";
import { Command } from "$lib/domain/models/Command";
import { canNormalSummon, performNormalSummon } from "$lib/domain/rules/SummonRule";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

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
   * 2. 召喚ルールを満たしていること（レベルに応じたリリース要件を含む）
   */
  canExecute(state: GameSnapshot): ValidationResult {
    if (state.result.isGameOver) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.GAME_OVER);
    }
    return canNormalSummon(state, this.cardInstanceId);
  }

  /**
   * 指定カードをセットする
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. セット処理の実行（レベルに応じて即時実行またはリリース選択ステップを返す）
   */
  execute(state: GameSnapshot): GameCommandResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return Command.Result.failure(state, GameProcessing.Validation.errorMessage(validationResult));
    }

    // 2. セット処理の実行
    const result = performNormalSummon(state, this.cardInstanceId, "defense");
    if (result.type === "immediate") {
      // 即時セットが可能な場合、状態を更新して成功を返す
      return Command.Result.success(result.state, result.message, undefined, result.activationSteps);
    } else {
      // リリース選択が必要な場合、状態は変更せずにリリース選択ステップを返す
      return Command.Result.success(state, result.message, undefined, [result.step]);
    }
  }

  /** セット対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
