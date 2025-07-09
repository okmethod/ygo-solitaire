import type { DuelState } from "$lib/classes/DuelState";
import type { Card } from "$lib/types/card";
import type { Effect, EffectResult, EffectType, EffectContext } from "$lib/types/effect";

/**
 * 効果の基底抽象クラス
 * 全ての効果クラスはこのクラスを継承する
 */
export abstract class BaseEffect implements Effect {
  public readonly id: string;
  public readonly name: string;
  public readonly type: EffectType;
  public readonly description: string;
  public readonly cardId: number;

  constructor(id: string, name: string, type: EffectType, description: string, cardId: number) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.description = description;
    this.cardId = cardId;
  }

  /**
   * 効果が発動可能かどうかを判定する
   * 継承先でオーバーライドして具体的な条件を実装
   */
  abstract canActivate(state: DuelState): boolean;

  /**
   * 効果を実行する
   * 継承先でオーバーライドして具体的な効果処理を実装
   */
  abstract execute(state: DuelState): EffectResult;

  /**
   * 効果実行前の共通処理
   * ログ出力や状態チェックなどを行う
   */
  protected preExecute(state: DuelState, context?: EffectContext): boolean {
    console.log(`[Effect] ${this.name} (${this.id}) の実行を開始します`);
    console.log("context:", context);

    // 基本的な実行可能性チェック
    if (!this.canActivate(state)) {
      console.warn(`[Effect] ${this.name} は現在発動できません`);
      return false;
    }

    return true;
  }

  /**
   * 効果実行後の共通処理
   * 結果のログ出力や後処理を行う
   */
  protected postExecute(result: EffectResult, state: DuelState): EffectResult {
    if (result.success) {
      console.log(`[Effect] ${this.name} が正常に実行されました: ${result.message}`);
    } else {
      console.error(`[Effect] ${this.name} の実行に失敗しました: ${result.message}`);
    }

    // 将来的に勝利条件チェックなどで使用予定
    console.log(`[Effect] デバッグ情報: ゲーム状態 = ${state.gameResult}, フェイズ = ${state.currentPhase}`);

    // 勝利条件のチェック（効果実行後）
    if (result.stateChanged && !result.gameEnded) {
      const winConditionMet = this.checkWinCondition(state);
      if (winConditionMet) {
        result.gameEnded = true;
        result.message += " ゲームが終了しました！";
      }
    }

    return result;
  }

  /**
   * 勝利条件をチェックする
   * 基底クラスではfalseを返し、必要に応じて継承先でオーバーライド
   */
  protected checkWinCondition(state: DuelState): boolean {
    console.log(`[Effect] 勝利条件のチェックを行います:`, state.gameResult);
    return false;
  }

  /**
   * エラー結果を生成するヘルパーメソッド
   */
  protected createErrorResult(message: string): EffectResult {
    return {
      success: false,
      message,
      stateChanged: false,
      gameEnded: false,
    };
  }

  /**
   * 成功結果を生成するヘルパーメソッド
   */
  protected createSuccessResult(message: string, stateChanged: boolean = true, drawnCards?: Card[]): EffectResult {
    return {
      success: true,
      message,
      stateChanged,
      drawnCards,
      gameEnded: false,
    };
  }
}
