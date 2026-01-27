/**
 * IntoTheVoidActivation - 《無の煉獄》(Into the Void)
 *
 * Card ID: 93946239 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 手札が3枚以上、デッキに1枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 1枚ドロー、エンドフェイズに手札を全て捨てる
 *
 * @module domain/effects/actions/spells/individuals/IntoTheVoidActivation
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
import { discardAllHandEndPhaseStep } from "$lib/domain/effects/steps/discards";

/** 《無の煉獄》効果クラス */
export class IntoTheVoidActivation extends NormalSpellAction {
  constructor() {
    super(93946239);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 自分の手札が3枚以上であること
   * 2. デッキに1枚以上あること
   *
   */
  protected individualConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
    // 1. 自分の手札が3枚以上であること
    if (state.zones.hand.length < 3) {
      return failureValidationResult(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
    }

    // 2. デッキに1枚以上あること
    if (state.zones.deck.length < 1) {
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
   * 1. 1枚ドロー
   * 2. エンドフェイズに手札を全て捨てる効果を登録
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [drawStep(1), discardAllHandEndPhaseStep()];
  }
}
