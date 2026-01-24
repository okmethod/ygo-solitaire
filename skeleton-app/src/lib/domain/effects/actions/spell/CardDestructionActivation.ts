/**
 * CardDestructionActivation - 《手札断札》(Card Destruction)
 *
 * Card ID: 74519184 | Type: Spell | Subtype: Quick-Play
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、手札が3枚以上（発動カード含む+捨てる2枚）
 * - ACTIVATION: 発動通知
 * - RESOLUTION: プレイヤーが2枚破棄、相手が2枚破棄（内部処理）、両者が2枚ドロー、墓地へ送る
 *
 * @module domain/effects/actions/spell/CardDestructionActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { QuickPlaySpellAction } from "$lib/domain/effects/base/spell/QuickPlaySpellAction";
import { drawStep } from "$lib/domain/effects/steps/draws";
import { selectAndDiscardStep } from "$lib/domain/effects/steps/discards";

/**
 * CardDestructionActivation
 *
 * Extends QuickPlaySpellAction for Card Destruction implementation.
 */
export class CardDestructionActivation extends QuickPlaySpellAction {
  constructor() {
    super(74519184);
  }

  /**
   * Card-specific activation conditions
   *
   * - Hand must have at least 3 cards (spell + 2 to discard)
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  protected individualConditions(state: GameState): boolean {
    // Hand must have at least 3 cards (spell + 2 to discard)
    return state.zones.hand.length >= 3;
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 効果の流れ:
   * 1. プレイヤーが手札から2枚選んで墓地へ送る
   * 2. 相手が手札から2枚墓地へ送る（内部状態のみ、1ターンキルでは実装不要）
   * 3. 両プレイヤーがデッキから2枚ドロー
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: プレイヤーが手札から2枚選んで墓地へ送る
      selectAndDiscardStep(2),

      // Step 2: 相手が手札から2枚墓地へ送る（内部状態のみ）
      {
        id: "card-destruction-discard-opponent",
        summary: "相手が手札を捨てる",
        description: "相手が手札から2枚捨てます（内部状態のみ）",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // 1ターンキルモードでは相手の手札をUIで管理していないため、
          // このステップは将来の拡張性のために残されています。
          // 実際の状態変更は不要です。

          return {
            success: true,
            updatedState: currentState,
            message: "Opponent discarded 2 cards (internal)",
          };
        },
      },

      // Step 3: 両プレイヤーがデッキから2枚ドロー（実際は自分だけドロー）
      drawStep(2),
    ];
  }
}
