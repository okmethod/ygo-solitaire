import { BaseEffect } from "../BaseEffect";
import { EffectType } from "$lib/types/effect";
import type { DuelState } from "$lib/classes/DuelState";
import type { EffectResult } from "$lib/types/effect";

/**
 * 汎用的なドロー効果
 * N枚のカードをドローするアトミック効果
 */
export class DrawEffect extends BaseEffect {
  private readonly drawCount: number;

  constructor(id: string, name: string, description: string, cardId: number, drawCount: number) {
    super(id, name, EffectType.DRAW, description, cardId);
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
  execute(state: DuelState): EffectResult {
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
