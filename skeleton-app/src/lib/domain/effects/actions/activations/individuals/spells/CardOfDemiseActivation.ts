/**
 * CardOfDemiseActivation - 《命削りの宝札》(Card of Demise)
 *
 * Card ID: 59750328 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 1ターンに1度制限
 * - ACTIVATION: 無し
 * - RESOLUTION: 手札が3枚になるようにドロー、エンドフェイズに手札を全て捨てる
 *
 * @module domain/effects/actions/spells/individuals/CardOfDemiseActivation
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import { fillHandsStep } from "$lib/domain/effects/steps/draws";
import { discardAllHandEndPhaseStep } from "$lib/domain/effects/steps/discards";

/** 《命削りの宝札》効果クラス */
export class CardOfDemiseActivation extends NormalSpellActivation {
  constructor() {
    super(59750328);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 1ターンに1度制限をクリアしていること
   */
  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // 1. 1ターンに1度制限: 既にこのターン発動済みでないかチェック
    if (state.activatedCardIds.has(this.cardId)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
    }

    return GameProcessing.Validation.success();
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
   * 効果:
   * 1. 手札が3枚になるまでドロー
   * 2. エンドフェイズに手札を全て捨てる効果を登録
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [fillHandsStep(3), discardAllHandEndPhaseStep()];
  }
}
