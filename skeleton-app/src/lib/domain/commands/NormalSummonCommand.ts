/**
 * NormalSummonCommand - 通常召喚コマンド（召喚・セット統合）
 *
 * 手札からモンスターカードを通常召喚またはセットする Command パターン実装。
 * 召喚権を1消費し、モンスターをメインモンスターゾーンに配置する。
 * - 召喚: 表側攻撃表示
 * - セット: 裏側守備表示
 * レベルに応じて、アドバンス召喚になる場合はリリース選択ステップを返す。
 *
 * @module domain/commands/NormalSummonCommand
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import type { GameCommand, GameCommandResult } from "$lib/domain/models/Command";
import { Command } from "$lib/domain/models/Command";
import { canNormalSummon, performNormalSummon } from "$lib/domain/rules/SummonRule";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/** 通常召喚モード: 召喚（表側攻撃表示）またはセット（裏側守備表示） */
type NormalSummonMode = "summon" | "set";

/** 通常召喚コマンドクラス（召喚・セット統合） */
export class NormalSummonCommand implements GameCommand {
  readonly description: string;

  constructor(
    private readonly cardInstanceId: string,
    private readonly mode: NormalSummonMode,
  ) {
    this.description = mode === "summon" ? `Summon monster ${cardInstanceId}` : `Set monster ${cardInstanceId}`;
  }

  /**
   * 指定カードを通常召喚可能か判定する
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
   * 指定カードを通常召喚（召喚またはセット）する
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 召喚またはセット処理の実行（レベルに応じて即時実行またはリリース選択ステップを返す）
   */
  execute(state: GameSnapshot): GameCommandResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return Command.Result.failure(state, GameProcessing.Validation.errorMessage(validationResult));
    }

    // 2. 召喚またはセット処理の実行
    const battlePosition = this.mode === "summon" ? "attack" : "defense";
    const result = performNormalSummon(state, this.cardInstanceId, battlePosition);
    if (result.type === "immediate") {
      // リリース不要の場合、状態を更新して成功を返す
      return Command.Result.success(result.state, result.message, undefined, result.activationSteps);
    } else {
      // リリース選択が必要な場合、状態は変更せずにリリース選択ステップを返す
      return Command.Result.success(state, result.message, undefined, [result.step]);
    }
  }

  /** 通常召喚対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }

  /** 通常召喚モードを取得する */
  getMode(): NormalSummonMode {
    return this.mode;
  }
}
