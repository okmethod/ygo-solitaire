/**
 * ChickenGameActivation - 《チキンレース》(Chicken Game)
 *
 * Card ID: 67616300 | Type: Spell | Subtype: Field
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 無し
 * - ACTIVATION: 無し
 * - RESOLUTION: 無し
 *
 * 永続効果: @see ChickenGameContinuousRule
 * 起動効果: @see ChickenGameIgnitionEffect
 *
 * @module domain/effects/actions/spells/individuals/ChickenGameActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { FieldSpellAction } from "$lib/domain/effects/actions/spells/FieldSpellAction";

/** 《チキンレース》効果クラス */
export class ChickenGameActivation extends FieldSpellAction {
  constructor() {
    super(67616300);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * @protected
   */
  protected individualConditions(_state: GameState): boolean {
    return true; // 固有条件無し
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
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return []; // 固有ステップ無し
  }
}
