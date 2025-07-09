import { EffectComposer } from "$lib/classes/effects/primitives/EffectComposer";
import { DrawEffect } from "$lib/classes/effects/primitives/DrawEffect";
import { DiscardEffect } from "$lib/classes/effects/primitives/DiscardEffect";
import type { DuelState } from "$lib/classes/DuelState";

/**
 * 天使の施しの効果
 * 通常魔法カード - 3枚ドロー後、手札から2枚捨てる
 *
 * 遊戯王OCGテキスト:
 * (1)：自分はデッキから３枚ドローする。
 * その後、手札を２枚選んで捨てる。
 *
 * 実装方式:
 * - コンポジションベース（継承ではなく組み合わせ）
 * - DrawEffect（3枚ドロー）+ DiscardEffect（2枚捨て）
 * - primitives効果の再利用により実装
 *
 * 発動条件の特別な処理:
 * - 手札が0枚や1枚でも発動可能（3枚ドロー後に2枚捨てるため）
 * - デッキに3枚以上あり、ドロー後に2枚捨てられることが条件
 *
 * 利点:
 * 1. 効果が明確に分離されている
 * 2. DrawEffectとDiscardEffectが独立してテスト可能
 * 3. 他のカードでも同じprimitives効果を再利用可能
 * 4. 複雑な効果でも理解しやすい構造
 */
export class GracefulCharityEffect extends EffectComposer {
  constructor() {
    // カードID: 79571449 (天使の施し)
    // 効果の組み合わせ: 3枚ドロー → 2枚捨て
    super("graceful-charity", "天使の施し", "デッキから3枚ドローし、その後手札から2枚捨てる", 79571449, [
      // 1. まず3枚ドローする
      new DrawEffect("graceful-charity-draw", "3枚ドロー", "デッキから3枚ドローする", 79571449, 3),

      // 2. その後手札から2枚捨てる
      new DiscardEffect("graceful-charity-discard", "2枚捨てる", 2, 79571449),
    ]);
  }

  /**
   * 天使の施し専用の発動条件
   * - デッキに3枚以上のカードがある
   * - ドロー後に2枚捨てられる（現在の手札 + 3枚 >= 2枚）
   * - ゲーム継続中かつ適切なフェイズ
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

    // デッキに3枚以上のカードがあるかチェック
    if (state.mainDeck.length < 3) {
      return false;
    }

    // 3枚ドローした後は必ず2枚以上の手札になるため、
    // 捨てる条件は常に満たされる
    return true;
  }
}
