import type { DuelState } from "$lib/classes/DuelState";
import { DrawEffect } from "$lib/classes/effects/primitives/DrawEffect";

/**
 * 強欲な壺
 * 通常魔法カード - デッキから2枚ドローする
 */
export class PotOfGreedEffect extends DrawEffect {
  constructor() {
    super("pot-of-greed", "強欲な壺", "デッキから2枚ドローする", 55144522, 2);
  }

  /**
   * 発動条件
   * - ゲーム継続中かつ適切なフェイズ
   * - デッキに2枚以上のカードがある
   */
  canActivate(state: DuelState): boolean {
    // ゲームが継続中かチェック
    if (!this.isGameOngoing(state)) {
      return false;
    }

    // 通常魔法として適切なフェイズかチェック
    if (!this.isValidSpellPhase(state)) {
      return false;
    }

    // 基本のドロー条件をチェック
    if (!super.canActivate(state)) {
      return false;
    }

    return true;
  }
}
