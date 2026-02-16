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

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { FieldSpellActivation } from "$lib/domain/effects/actions/activations/FieldSpellActivation";

/** 《チキンレース》効果クラス */
export class ChickenGameActivation extends FieldSpellActivation {
  constructor() {
    super(67616300);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * @protected
   */
  protected individualConditions(_state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    return GameProcessing.Validation.success(); // 固有条件無し
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   */
  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 固有ステップ無し
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 固有ステップ無し
  }
}
