import type { DuelState } from "$lib/classes/DuelState";
import { BaseEffect } from "$lib/classes/effects/bases/BaseEffect";
import { EffectType } from "$lib/types/effect";
import type { EffectResult } from "$lib/types/effect";
import type { Card } from "$lib/types/card";

/**
 * 手札から指定した枚数のカードを捨てる効果
 *
 * 設計思想:
 * - 単一責任: 手札から墓地に送るのみ
 * - 再利用可能: 他の効果と組み合わせ可能
 * - 柔軟性: 任意の枚数に対応
 *
 * 使用例:
 * - 天使の施し: 3枚ドロー後に2枚捨てる
 * - コストとしての手札捨て
 * - 手札調整効果
 */
export class DiscardEffect extends BaseEffect {
  private discardCount: number;

  constructor(id: string = "discard-effect", name: string = "手札捨て", discardCount: number = 1, cardId: number = 0) {
    super(id, name, EffectType.ACTIVATE, `手札から${discardCount}枚捨てる`, cardId);
    this.discardCount = discardCount;
  }

  /**
   * 発動条件: 手札に十分な枚数のカードがあること
   */
  canActivate(state: DuelState): boolean {
    // ゲーム継続中かチェック
    if (state.gameResult !== "ongoing") {
      console.log(`[${this.name}] ゲーム終了: ${state.gameResult}`);
      return false;
    }

    // 手札に十分な枚数があるかチェック
    if (state.hands.length < this.discardCount) {
      console.log(`[${this.name}] 手札不足: 必要${this.discardCount}枚、現在${state.hands.length}枚`);
      return false;
    }

    return true;
  }

  /**
   * 効果実行: 手札から指定枚数を墓地に送る
   * 現在の実装では手札の最後からカードを捨てる（ランダム性は将来的に実装）
   */
  execute(state: DuelState): EffectResult {
    console.log(`[${this.name}] 手札から${this.discardCount}枚捨てる効果を実行します`);

    // 発動条件の再チェック
    if (!this.canActivate(state)) {
      return this.createErrorResult("発動条件を満たしていません");
    }

    const initialHandSize = state.hands.length;
    const discardedCards: Card[] = [];

    // 指定枚数だけ手札から墓地に送る
    for (let i = 0; i < this.discardCount; i++) {
      // 手札の最後のカードを取得（実際のゲームではプレイヤーが選択）
      const cardToDiscard = state.hands[state.hands.length - 1];

      if (!cardToDiscard) {
        console.error(`[${this.name}] 捨てるカードが見つかりません（${i + 1}枚目）`);
        return this.createErrorResult(`手札からカードを捨てることができませんでした`);
      }

      // sendToGraveyardメソッドを使用してカードを墓地に送る
      const success = state.sendToGraveyard(cardToDiscard.id, "hand");

      if (!success) {
        console.error(`[${this.name}] カードID ${cardToDiscard.id} を墓地に送れませんでした`);
        return this.createErrorResult(`カード「${cardToDiscard.name}」を墓地に送ることができませんでした`);
      }

      discardedCards.push(cardToDiscard);
      console.log(`[${this.name}] カード「${cardToDiscard.name}」を墓地に送りました`);
    }

    const finalHandSize = state.hands.length;
    const actualDiscarded = initialHandSize - finalHandSize;

    console.log(
      `[${this.name}] ${actualDiscarded}枚のカードを手札から墓地に送りました ` +
        `(手札: ${initialHandSize} → ${finalHandSize}枚)`,
    );

    return this.createSuccessResult(`${actualDiscarded}枚のカードを手札から捨てました`, true, undefined);
  }
}
