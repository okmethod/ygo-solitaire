/**
 * UpstartGoblinActivation - 《成金ゴブリン》(Upstart Goblin)
 *
 * Card ID: 70368879 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: デッキに1枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 1枚ドロー、相手が1000LP回復
 *
 * @module domain/effects/actions/spells/individuals/UpstartGoblinActivation
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import { drawStep } from "$lib/domain/effects/steps/draws";
import { gainLpStep } from "$lib/domain/effects/steps/lifePoints";

/** 《成金ゴブリン》効果クラス */
export class UpstartGoblinActivation extends NormalSpellActivation {
  constructor() {
    super(70368879);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. デッキに1枚以上あること
   *
   * @protected
   */
  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    if (state.space.mainDeck.length < 1) {
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
   * 1. 1枚ドロー
   * 2. 相手が1000LP回復
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [drawStep(1), gainLpStep(1000, "opponent")];
  }
}
