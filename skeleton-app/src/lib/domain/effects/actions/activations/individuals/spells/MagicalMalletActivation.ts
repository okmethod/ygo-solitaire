/**
 * MagicalMalletActivation - 《打ち出の小槌》(Magical Mallet)
 *
 * Card ID: 85852291 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 無し
 * - ACTIVATION: 無し
 * - RESOLUTION: 手札から任意枚数選択、デッキに戻してシャッフル、同じ枚数ドロー
 *
 * @module domain/effects/actions/spells/individuals/MagicalMalletActivation
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { NormalSpellAction } from "$lib/domain/effects/actions/activations/NormalSpellAction";
import { selectReturnShuffleDrawStep } from "$lib/domain/effects/steps/compositeOperations";

/** 《打ち出の小槌》効果クラス */
export class MagicalMalletActivation extends NormalSpellAction {
  constructor() {
    super(85852291);
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
   * Note: デッキに戻す処理はコストではなく、効果として扱われる
   *
   * @protected
   */
  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 固有ステップ無し
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * 効果:
   * 1. 手札から任意枚数選択し、デッキに戻してシャッフル、同じ枚数ドロー
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [selectReturnShuffleDrawStep({ min: 0 })];
  }
}
