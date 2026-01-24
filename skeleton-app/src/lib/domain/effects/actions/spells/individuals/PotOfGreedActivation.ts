/**
 * PotOfGreedActivation - 《強欲な壺》(Pot of Greed)
 *
 * Card ID: 55144522 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: デッキに2枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 2枚ドロー
 *
 * @module domain/effects/actions/spells/individuals/PotOfGreedActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/actions/spells/NormalSpellAction";
import { drawStep } from "$lib/domain/effects/steps/draws";

/** 《強欲な壺》効果クラス */
export class PotOfGreedActivation extends NormalSpellAction {
  constructor() {
    super(55144522);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. デッキに2枚以上あること
   */
  protected individualConditions(state: GameState): boolean {
    // 1. デッキに2枚以上あること
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
   * 1. 2枚ドロー
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [drawStep(2)];
  }
}
