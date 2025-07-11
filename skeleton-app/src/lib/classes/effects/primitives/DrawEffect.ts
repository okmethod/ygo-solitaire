import { BaseEffect } from "$lib/classes/effects/bases/BaseEffect";
import type { DuelState } from "$lib/classes/DuelState";
import type { EffectResult } from "$lib/types/effect";
import type { Card } from "$lib/types/card";

/**
 * 汎用的なドロー効果
 * N枚のカードをドローするアトミック効果
 */
export class DrawEffect extends BaseEffect {
  private readonly drawCount: number;

  constructor(id: string, name: string, description: string, cardId: number, drawCount: number) {
    super(id, name, description, cardId);
    this.drawCount = drawCount;
  }

  /**
   * ドロー効果が発動可能かどうかを判定
   * デッキに必要な枚数のカードがあるかチェック
   */
  canActivate(state: DuelState): boolean {
    return state.mainDeck.length >= this.drawCount;
  }

  /**
   * ドロー効果を実行
   * 指定された枚数のカードをデッキからドローする
   */
  async execute(state: DuelState): Promise<EffectResult> {
    if (!this.canActivate(state)) {
      return this.createErrorResult(
        `デッキに${this.drawCount}枚のカードがありません（残り${state.mainDeck.length}枚）`,
      );
    }

    try {
      const drawnCards = state.drawCard(this.drawCount);

      if (drawnCards.length !== this.drawCount) {
        return this.createErrorResult(
          `${this.drawCount}枚ドローしようとしましたが、${drawnCards.length}枚しかドローできませんでした`,
        );
      }

      const result = this.createSuccessResult(`${drawnCards.length}枚ドローしました`, true, drawnCards);

      return this.postExecute(result, state);
    } catch (error) {
      return this.createErrorResult(
        `ドロー処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * ステップバイステップでドロー効果を実行
   * 各カードを0.5秒間隔で個別にドローする
   */
  async executeStepByStep(state: DuelState): Promise<EffectResult> {
    if (!this.canActivate(state)) {
      return this.createErrorResult(
        `デッキに${this.drawCount}枚のカードがありません（残り${state.mainDeck.length}枚）`,
      );
    }

    try {
      const drawnCards: Card[] = [];

      for (let i = 0; i < this.drawCount; i++) {
        // 1枚ずつドロー
        const singleDrawResult = state.drawCard(1);
        if (singleDrawResult.length === 0) {
          return this.createErrorResult(`${i + 1}枚目のドローに失敗しました（デッキ不足）`);
        }

        drawnCards.push(singleDrawResult[0]);

        // 最後のドロー以外は0.5秒待機
        if (i < this.drawCount - 1) {
          await this.delay(500);
        }
      }

      const result = this.createSuccessResult(`${drawnCards.length}枚ドローしました`, true, drawnCards);

      return this.postExecute(result, state);
    } catch (error) {
      return this.createErrorResult(
        `ドロー処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 指定されたミリ秒数だけ待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * ドロー枚数を取得
   */
  getDrawCount(): number {
    return this.drawCount;
  }

  /**
   * 効果の詳細情報を取得
   */
  getDetailInfo(): {
    drawCount: number;
    effectType: string;
    requiresDecking: number;
  } {
    return {
      drawCount: this.drawCount,
      effectType: "draw",
      requiresDecking: this.drawCount,
    };
  }
}
