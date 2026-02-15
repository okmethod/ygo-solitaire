/**
 * SummonMonsterCommand - モンスター召喚コマンド
 *
 * 手札からモンスターカードを通常召喚する Command パターン実装。
 * 召喚権を1消費し、モンスターを表側攻撃表示でメインモンスターゾーンに配置する。
 *
 * @module domain/commands/SummonMonsterCommand
 */

import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import type { GameCommand, GameCommandResult } from "$lib/domain/models/Command";
import { Command } from "$lib/domain/models/Command";
import { canNormalSummon, executeNormalSummon } from "$lib/domain/rules/SummonRule";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

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
   * 3. 指定カードがモンスターカードであり、手札に存在すること
   */
  canExecute(state: GameSnapshot): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.GAME_OVER);
    }

    // 2. 通常召喚ルールを満たしていること
    const validationResult = canNormalSummon(state);
    if (!validationResult.isValid) {
      return validationResult;
    }

    // 3. 指定カードがモンスターカードであり、手札に存在すること
    const cardInstance = GameState.Space.findCard(state.space, this.cardInstanceId);
    if (!cardInstance) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_FOUND);
    }
    if (!Card.isMonster(cardInstance)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MONSTER_CARD);
    }
    if (!Card.Instance.inHand(cardInstance)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_IN_HAND);
    }

    return GameProcessing.Validation.success();
  }

  /**
   * 指定カードを通常召喚する
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築
   * 3. 戻り値の構築
   */
  execute(state: GameSnapshot): GameCommandResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return Command.Result.failure(state, GameProcessing.Validation.errorMessage(validationResult));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = GameState.Space.findCard(state.space, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedState: GameSnapshot = executeNormalSummon(state, this.cardInstanceId, "attack");

    // 3. 戻り値の構築
    return Command.Result.success(
      updatedState,
      `Monster summoned: ${cardInstance.jaName}`,
      // TODO: 召喚成功時に誘発する効果があればここに追加
    );
  }

  /** 召喚対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
