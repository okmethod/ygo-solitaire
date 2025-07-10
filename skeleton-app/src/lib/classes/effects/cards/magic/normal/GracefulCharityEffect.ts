import { BaseMagicEffect } from "$lib/classes/effects/bases/BaseMagicEffect";
import { DrawEffect } from "$lib/classes/effects/primitives/DrawEffect";
import type { DuelState } from "$lib/classes/DuelState";
import type { InteractiveEffectResult } from "$lib/types/effect";
import type { Card } from "$lib/types/card";

/**
 * 天使の施し
 * 通常魔法カード - 3枚ドロー後、手札から2枚捨てる
 */
export class GracefulCharityEffect extends BaseMagicEffect {
  private drawEffect: DrawEffect;

  constructor() {
    super("graceful-charity", "天使の施し", "デッキから3枚ドローし、その後手札から2枚捨てる", 79571449, "normal");
    this.drawEffect = new DrawEffect("graceful-charity-draw", "3枚ドロー", "デッキから3枚ドローする", 79571449, 3);
  }

  /**
   * 発動条件
   * - BaseMagicEffect の通常魔法チェック
   * - デッキに3枚以上のカードがある
   * - ドロー後に2枚捨てられる（現在の手札 + 3枚 >= 2枚）
   */
  canActivate(state: DuelState): boolean {
    // 基本の魔法カード発動条件をチェック
    if (!super.canActivate(state)) {
      return false;
    }

    // ドロー効果の発動条件をチェック（デッキに3枚以上）
    if (!this.drawEffect.canActivate(state)) {
      return false;
    }

    // 3枚ドローした後は必ず2枚以上の手札になるため、
    // 捨てる条件は常に満たされる
    return true;
  }

  /**
   * 魔法効果の解決: 3枚ドロー → 手札選択UI表示
   */
  protected resolveMagicEffect(state: DuelState): InteractiveEffectResult {
    console.log(`[${this.name}] 効果解決: 3枚ドロー → 手札選択`);

    // 1. まず3枚ドローする
    const drawResult = this.drawEffect.execute(state);
    if (!drawResult.success) {
      return this.createErrorResult(`${this.name}: ドロー効果実行に失敗 - ${drawResult.message}`) as InteractiveEffectResult;
    }

    console.log(`[${this.name}] 3枚ドロー完了。手札選択UIを表示します`);

    // 2. 手札選択UIを表示するためのInteractiveEffectResultを返す
    const result: InteractiveEffectResult = {
      success: true,
      message: "3枚ドローしました。手札から2枚選んで捨ててください",
      stateChanged: true,
      drawnCards: drawResult.drawnCards,
      requiresCardSelection: {
        title: "天使の施し - 手札を捨てる",
        description: "手札から2枚選んで捨ててください",
        cards: [...state.hands], // 現在の手札をコピー
        maxSelections: 2,
        onSelection: (selectedCards: Card[]) => {
          this.handleCardSelection(selectedCards, state);
        }
      }
    };

    return result;
  }

  /**
   * 手札選択後の処理
   */
  private handleCardSelection(selectedCards: Card[], state: DuelState): void {
    console.log(`[${this.name}] 選択されたカード:`, selectedCards.map(c => c.name));
    
    // 選択されたカードを墓地に送る
    for (const card of selectedCards) {
      const success = state.sendToGraveyard(card.id, "hand");
      if (!success) {
        console.error(`[${this.name}] カード「${card.name}」を墓地に送れませんでした`);
      }
    }
    
    console.log(`[${this.name}] 天使の施しの効果解決が完了しました`);
    // 注意: 魔法カード自体の墓地送りは、BaseMagicEffectがインタラクティブ効果完了後に自動実行する
  }
}
