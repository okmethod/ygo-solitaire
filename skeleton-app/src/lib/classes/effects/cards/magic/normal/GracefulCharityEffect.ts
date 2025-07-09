import { EffectComposer } from "$lib/classes/effects/bases/EffectComposer";
import { DrawEffect } from "$lib/classes/effects/primitives/DrawEffect";
import { DiscardEffect } from "$lib/classes/effects/primitives/DiscardEffect";
import type { DuelState } from "$lib/classes/DuelState";

/**
 * 天使の施し
 * 通常魔法カード - 3枚ドロー後、手札から2枚捨てる
 */
export class GracefulCharityEffect extends EffectComposer {
  constructor() {
    // 効果の組み合わせ
    super("graceful-charity", "天使の施し", "デッキから3枚ドローし、その後手札から2枚捨てる", 79571449, [
      // 1. まず3枚ドローする
      new DrawEffect("graceful-charity-draw", "3枚ドロー", "デッキから3枚ドローする", 79571449, 3),
      // 2. その後手札から2枚捨てる
      new DiscardEffect("graceful-charity-discard", "2枚捨てる", 2, 79571449),
    ]);
  }

  /**
   * 発動条件
   * - ゲーム継続中かつ適切なフェイズ
   * - デッキに3枚以上のカードがある
   * - ドロー後に2枚捨てられる（現在の手札 + 3枚 >= 2枚）
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

    // DrawEffectの発動条件（デッキに3枚以上）のみチェック
    // DiscardEffectの発動条件は実行時（ドロー後）の状態に依存するため、
    // 個別に手動でチェックする必要がある
    if (state.mainDeck.length < 3) {
      return false;
    }

    // 3枚ドローした後は必ず2枚以上の手札になるため、
    // 捨てる条件は常に満たされる
    return true;
  }
}
