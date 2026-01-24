/**
 * CardDestructionActivation - 《手札断札》(Card Destruction)
 *
 * Card ID: 74519184 | Type: Spell | Subtype: Quick-Play
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 捨てられる手札が2枚以上、デッキに2枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 手札を2枚捨てる、2枚ドロー
 *
 * Note: 相手の捨てる処理・ドロー処理は未実装
 *
 * @module domain/effects/actions/spells/individuals/CardDestructionActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { QuickPlaySpellAction } from "$lib/domain/effects/actions/spells/QuickPlaySpellAction";
import { countHandExcludingSelf } from "$lib/domain/models/Zone";
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
   * 1. このカードを除き、手札が2枚以上であること
   * 2. デッキに2枚以上あること
   */
  protected individualConditions(state: GameState, sourceInstance: CardInstance): boolean {
    // 1. このカードを除き、手札が2枚以上であること
    if (countHandExcludingSelf(state.zones, sourceInstance) < 2) {
      return false;
    }

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
  protected individualActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
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
  protected individualResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [selectAndDiscardStep(2), drawStep(2)];
  }
}
