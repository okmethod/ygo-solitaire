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

    // 通常魔法の発動条件
    // メインフェイズ1またはメインフェイズ2で発動可能
    const isMainPhase = state.currentPhase === "メインフェイズ1" || state.currentPhase === "メインフェイズ2";

    if (!isMainPhase) {
      console.warn(`[PotOfGreedEffect] 通常魔法は${state.currentPhase}では発動できません`);
      return false;
    }

    // ゲームが継続中であることを確認
    if (state.gameResult !== "ongoing") {
      console.warn(`[PotOfGreedEffect] ゲームが既に終了しています: ${state.gameResult}`);
      return false;
    }

    return true;
  }

  /**
   * 強欲な壺特有の効果情報
   */
  getCardInfo(): {
    cardName: string;
    cardType: string;
    rarity: string;
    isLimited: boolean;
  } {
    return {
      cardName: "強欲な壺",
      cardType: "通常魔法",
      rarity: "禁止",
      isLimited: true, // 実際のOCGでは禁止カード
    };
  }

  /**
   * 効果発動時のフレーバーテキスト
   */
  getFlavorText(): string {
    return "邪悪な壺の魔力により、デッキから2枚のカードを引き寄せる...";
  }
}
