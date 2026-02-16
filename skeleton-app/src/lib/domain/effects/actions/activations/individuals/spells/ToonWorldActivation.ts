/**
 * ToonWorldActivation - 《トゥーン・ワールド》(Toon World)
 *
 * Card ID: 15259703 | Type: Spell | Subtype: Continuous
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: LP>1000
 * - ACTIVATION: 1000LP支払い
 * - RESOLUTION: 無し
 *
 * @module domain/effects/actions/spells/individuals/ToonWorldActivation
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { ContinuousSpellActivation } from "$lib/domain/effects/actions/activations/ContinuousSpellActivation";
import { payLpStep } from "$lib/domain/effects/steps/lifePoints";

/** 《トゥーン・ワールド》効果クラス */
export class ToonWorldActivation extends ContinuousSpellActivation {
  constructor() {
    super(15259703);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. プレイヤーのLPが1000以上であること
   */
  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // 1. プレイヤーのLPが1000以上であること
    if (state.lp.player < 1000) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
    }

    return GameProcessing.Validation.success();
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * コスト: 1000LP支払う
   *
   * @protected
   */
  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [payLpStep(1000, "player")];
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
