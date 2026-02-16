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

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import { salvageFromGraveyardStep } from "$lib/domain/effects/steps/searches";

/** 《闇の量産工場》効果クラス */
export class DarkFactoryActivation extends NormalSpellActivation {
  constructor() {
    super(90928333);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 墓地に通常モンスターが2枚以上いること
   */
  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    const normalMonsters = state.space.graveyard.filter(
      (card) => card.type === "monster" && card.frameType === "normal",
    );
    if (normalMonsters.length < 2) {
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
   * 1. 通常モンスター2枚をサルベージ
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
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
