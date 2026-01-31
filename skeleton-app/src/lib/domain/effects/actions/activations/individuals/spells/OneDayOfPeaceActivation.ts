/**
 * OneDayOfPeaceActivation - 《一時休戦》(One Day of Peace)
 *
 * Card ID: 33782437 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: デッキに1枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 1枚ドロー、ダメージ無効化フラグ設定
 *
 * Note: 相手のドロー処理は未実装
 *
 * @module domain/effects/actions/spells/individuals/OneDayOfPeaceActivation
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
import { NormalSpellAction } from "$lib/domain/effects/actions/activations/NormalSpellAction";
import { drawStep } from "$lib/domain/effects/steps/draws";

/** 《一時休戦》効果クラス */
export class OneDayOfPeaceActivation extends NormalSpellAction {
  constructor() {
    super(33782437);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. デッキに1枚以上あること
   */
  protected individualConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
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
   * 2. ダメージ無効化フラグ設定
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      // 1. 1枚ドロー
      drawStep(1),

      // 2. ダメージ無効化フラグ設定
      // TODO: ルール追加系のステップの扱いを検討する
      {
        id: "one-day-of-peace-damage-negation",
        summary: "ダメージ無効化",
        description: "このターン、全てのダメージは0になります",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          const updatedState: GameState = {
            ...currentState,
            damageNegation: true,
          };

          return {
            success: true,
            updatedState,
            message: "Damage negation activated for this turn",
          };
        },
      },
    ];
  }
}
