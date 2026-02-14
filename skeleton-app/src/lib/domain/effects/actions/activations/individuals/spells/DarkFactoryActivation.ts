/**
 * DarkFactoryActivation - 《闇の量産工場》(Dark Factory of Mass Production)
 *
 * Card ID: 90928333 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 墓地に通常モンスターが2枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 通常モンスター2枚をサルベージ
 *
 * @module domain/effects/actions/spells/individuals/DarkFactoryActivation
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { CardInstance } from "$lib/domain/models/CardOld";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import {
  successValidationResult,
  failureValidationResult,
  ValidationErrorCode,
} from "$lib/domain/models/ValidationResult";
import { NormalSpellAction } from "$lib/domain/effects/actions/activations/NormalSpellAction";
import { salvageFromGraveyardStep } from "$lib/domain/effects/steps/searches";

/** 《闇の量産工場》効果クラス */
export class DarkFactoryActivation extends NormalSpellAction {
  constructor() {
    super(90928333);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 墓地に通常モンスターが2枚以上いること
   */
  protected individualConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
    const normalMonsters = state.zones.graveyard.filter(
      (card) => card.type === "monster" && card.frameType === "normal",
    );
    if (normalMonsters.length < 2) {
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
   * 1. 通常モンスター2枚をサルベージ
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    return [
      salvageFromGraveyardStep({
        id: `dark-factory-search-${sourceInstance.instanceId}`,
        summary: "通常モンスター2枚をサルベージ",
        description: "墓地から通常モンスター2枚を選択し、手札に加えます",
        filter: (card) => card.type === "monster" && card.frameType === "normal",
        minCards: 2,
        maxCards: 2,
        cancelable: false,
      }),
    ];
  }
}
