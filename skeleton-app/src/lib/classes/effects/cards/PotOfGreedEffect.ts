import type { DuelState } from "$lib/classes/DuelState";
import { DrawEffect } from "$lib/classes/effects/primitives/DrawEffect";

/**
 * 強欲な壺の効果
 * 通常魔法カード - デッキから2枚ドローする
 *
 * 遊戯王OCGテキスト:
 * (1)：自分はデッキから２枚ドローする。
 */
export class PotOfGreedEffect extends DrawEffect {
  constructor() {
    super(
      "pot-of-greed-55144522",
      "強欲な壺",
      "自分はデッキから２枚ドローする",
      55144522, // 強欲な壺のカードID
      2, // ドロー枚数
    );
  }

  /**
   * 強欲な壺の発動条件
   * 通常魔法なので、自分のメインフェイズに発動可能
   */
  canActivate(state: DuelState): boolean {
    // 基本のドロー条件をチェック
    if (!super.canActivate(state)) {
      return false;
    }

    // ゲームが継続中かチェック
    if (!this.isGameOngoing(state)) {
      console.warn(`[PotOfGreedEffect] ゲームが既に終了しています: ${state.gameResult}`);
      return false;
    }

    // 通常魔法の発動可能フェイズかチェック
    if (!this.isValidSpellPhase(state)) {
      console.warn(`[PotOfGreedEffect] 通常魔法は${state.currentPhase}では発動できません`);
      return false;
    }

    return true;
  }
}
