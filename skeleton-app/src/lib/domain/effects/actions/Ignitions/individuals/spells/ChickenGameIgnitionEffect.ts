/**
 * ChickenGameIgnitionEffect - 《チキンレース》(Chicken Game) 起動効果
 *
 * Card ID: 67616300 | Type: Spell | Subtype: Field
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: LP>1000、1ターンに1度制限
 * - ACTIVATION: 1000LP支払い
 * - RESOLUTION: デッキから1枚ドロー
 *
 * Note: 本来は3つの選択肢から1つを選択するが、実装簡略化のためドロー効果のみ実装している
 *
 * @module domain/effects/actions/spells/individuals/ChickenGameIgnitionEffect
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { BaseIgnitionEffect } from "$lib/domain/effects/actions/ignitions/BaseIgnitionEffect";
import { payLpStep } from "$lib/domain/effects/steps/lifePoints";
import { drawStep } from "$lib/domain/effects/steps/draws";

/** ChickenGameIgnitionEffect */
export class ChickenGameIgnitionEffect extends BaseIgnitionEffect {
  constructor() {
    super(67616300, 1);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. LP1000を超えていること
   * 2. このターンにこの効果を発動していないこと（1ターンに1度制限）
   */
  protected individualConditions(state: GameSnapshot, sourceInstance: CardInstance): ValidationResult {
    // 1. LP1000を超えていること
    if (state.lp.player <= 1000) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
    }

    // 2. このターンにこの効果を発動していないこと（1ターンに1度制限）
    if (sourceInstance.stateOnField?.activatedEffects?.has(this.effectId)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
    }

    return GameProcessing.Validation.success();
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * コスト:
   * 1. 1000LP支払い
   */
  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [payLpStep(1000, "player")];
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * 効果:
   * 1. 1枚ドロー
   */
  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [drawStep(1)];
  }
}
