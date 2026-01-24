/**
 * UpstartGoblinActivation - 《成金ゴブリン》(Upstart Goblin)
 *
 * Card ID: 70368879 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: デッキに1枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 1枚ドロー、相手が1000LP回復
 *
 * @module domain/effects/actions/spells/individuals/UpstartGoblinActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/actions/spells/NormalSpellAction";
import { drawStep } from "$lib/domain/effects/steps/draws";
import { gainLpStep } from "$lib/domain/effects/steps/lifePoints";

/** 《成金ゴブリン》効果クラス */
export class UpstartGoblinActivation extends NormalSpellAction {
  constructor() {
    super(70368879);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. デッキに1枚以上あること
   *
   * @protected
   */
  protected individualConditions(state: GameState): boolean {
    if (state.zones.deck.length < 1) {
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
   * 1. 1枚ドロー
   * 2. 相手が1000LP回復
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [drawStep(1), gainLpStep(1000, "opponent")];
  }
}
