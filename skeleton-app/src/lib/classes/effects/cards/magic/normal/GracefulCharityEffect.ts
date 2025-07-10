import { BaseMagicEffect } from "$lib/classes/effects/bases/BaseMagicEffect";
import { DrawEffect } from "$lib/classes/effects/primitives/DrawEffect";
import { DiscardEffect } from "$lib/classes/effects/primitives/DiscardEffect";
import type { DuelState } from "$lib/classes/DuelState";
import type { EffectResult } from "$lib/types/effect";

/**
 * 天使の施し
 * 通常魔法カード - 3枚ドロー後、手札から2枚捨てる
 */
export class GracefulCharityEffect extends BaseMagicEffect {
  private drawEffect: DrawEffect;
  private discardEffect: DiscardEffect;

  constructor() {
    super("graceful-charity", "天使の施し", "デッキから3枚ドローし、その後手札から2枚捨てる", 79571449, "normal");
    this.drawEffect = new DrawEffect("graceful-charity-draw", "3枚ドロー", "デッキから3枚ドローする", 79571449, 3);
    this.discardEffect = new DiscardEffect("graceful-charity-discard", "2枚捨てる", 2, 79571449);
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
   * 効果実行: 3枚ドロー → 2枚捨てる
   */
  execute(state: DuelState): EffectResult {
    console.log(`[${this.name}] 効果を実行します: 3枚ドロー → 2枚捨てる`);

    // 発動条件の再チェック
    if (!this.canActivate(state)) {
      return this.createErrorResult(`${this.name}は発動できません`);
    }

    // 1. まず3枚ドローする
    const drawResult = this.drawEffect.execute(state);
    if (!drawResult.success) {
      return this.createErrorResult(`${this.name}: ドロー効果実行に失敗 - ${drawResult.message}`);
    }

    // 2. その後手札から2枚捨てる
    const discardResult = this.discardEffect.execute(state);
    if (!discardResult.success) {
      return this.createErrorResult(`${this.name}: 捨てる効果実行に失敗 - ${discardResult.message}`);
    }

    return this.createSuccessResult("3枚ドロー → 2枚捨てる効果を実行しました", true, drawResult.drawnCards);
  }
}
