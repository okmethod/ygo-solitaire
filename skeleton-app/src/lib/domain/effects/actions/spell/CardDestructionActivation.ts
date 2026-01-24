/**
 * CardDestructionActivation - 《手札断札》(Card Destruction)
 *
 * Card ID: 74519184 | Type: Spell | Subtype: Quick-Play
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 手札が2枚以上、デッキに2枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 手札を2枚捨てる、2枚ドロー
 *
 * Note: 相手の捨てる処理・ドロー処理は未実装
 *
 * @module domain/effects/actions/spell/CardDestructionActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { QuickPlaySpellAction } from "$lib/domain/effects/base/spell/QuickPlaySpellAction";
import { drawStep } from "$lib/domain/effects/steps/draws";
import { selectAndDiscardStep } from "$lib/domain/effects/steps/discards";

/** 《手札断札》効果クラス */
export class CardDestructionActivation extends QuickPlaySpellAction {
  constructor() {
    super(74519184);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 手札が2枚以上あること
   * 2. デッキに2枚以上あること
   */
  protected individualConditions(state: GameState): boolean {
    // 1. 自分の手札が2枚以上であること
    // 手札から発動する場合は、このカード自身を除いた枚数をチェックする必要がある
    // FIXME: 要検討

    // 2. デッキに2枚以上あること
    if (state.zones.deck.length < 2) {
      return false;
    }

    return true;
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   */
  protected individualActivationSteps(_state: GameState): AtomicStep[] {
    return []; // 固有ステップ無し
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * 効果:
   * 1. 手札を2枚捨てる
   * 2. 2枚ドロー
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [selectAndDiscardStep(2), drawStep(2)];
  }
}
