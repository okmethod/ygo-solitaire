/**
 * GracefulCharityActivation - 《天使の施し》(Graceful Charity)
 *
 * Card ID: 79571449 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: デッキに3枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 3枚ドロー、手札を2枚捨てる
 *
 * @module domain/effects/actions/spells/individuals/GracefulCharityActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import {
  successValidationResult,
  failureValidationResult,
  ValidationErrorCode,
} from "$lib/domain/models/ValidationResult";
import { NormalSpellAction } from "$lib/domain/effects/actions/spells/NormalSpellAction";
import { drawStep } from "$lib/domain/effects/steps/draws";
import { selectAndDiscardStep } from "$lib/domain/effects/steps/discards";

/** 《天使の施し》効果クラス */
export class GracefulCharityActivation extends NormalSpellAction {
  constructor() {
    super(79571449);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. デッキに3枚以上あること
   */
  protected individualConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
    if (state.zones.deck.length < 3) {
      return failureValidationResult(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
    }

    return successValidationResult();
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
   * 1. 3枚ドロー
   * 2. 手札を2枚捨てる
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [drawStep(3), selectAndDiscardStep(2)];
  }
}
