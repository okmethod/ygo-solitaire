import type { DuelState } from "$lib/classes/DuelState";
import { BaseMagicEffect } from "$lib/classes/effects/bases/BaseMagicEffect";
import { DrawEffect } from "$lib/classes/effects/primitives/DrawEffect";
import type { EffectResult } from "$lib/types/effect";

/**
 * 強欲な壺
 * 通常魔法カード - デッキから2枚ドローする
 */
export class PotOfGreedEffect extends BaseMagicEffect {
  private drawEffect: DrawEffect;

  constructor() {
    super("pot-of-greed", "強欲な壺", "デッキから2枚ドローする", 55144522, "normal");
    this.drawEffect = new DrawEffect("pot-of-greed-draw", "2枚ドロー", "デッキから2枚ドローする", 55144522, 2);
  }

  /**
   * 発動条件
   * - BaseMagicEffect の通常魔法チェック
   * - デッキに2枚以上のカードがある
   */
  canActivate(state: DuelState): boolean {
    // 基本の魔法カード発動条件をチェック
    if (!super.canActivate(state)) {
      return false;
    }

    // ドロー効果の発動条件をチェック
    if (!this.drawEffect.canActivate(state)) {
      return false;
    }

    return true;
  }

  /**
   * 効果実行: 2枚ドロー
   */
  execute(state: DuelState): EffectResult {
    console.log(`[${this.name}] 効果を実行します`);

    // 発動条件の再チェック
    if (!this.canActivate(state)) {
      return this.createErrorResult(`${this.name}は発動できません`);
    }

    // ドロー効果を実行
    const drawResult = this.drawEffect.execute(state);

    if (!drawResult.success) {
      return this.createErrorResult(`${this.name}: ${drawResult.message}`);
    }

    return this.createSuccessResult(drawResult.message, true, drawResult.drawnCards);
  }
}
