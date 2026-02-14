/**
 * RoyalMagicalLibraryIgnitionEffect - 《王立魔法図書館》(Royal Magical Library) 起動効果
 *
 * Card ID: 70791313 | Type: Monster | Subtype: Effect
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 魔力カウンターが3つ以上
 * - ACTIVATION: 魔力カウンターを3つ取り除く
 * - RESOLUTION: 1枚ドロー
 *
 * Note: 魔力カウンターを置く効果は永続効果（RoyalMagicalLibraryContinuousEffect）
 *
 * @module domain/effects/actions/monsters/individuals/RoyalMagicalLibraryIgnitionEffect
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { CardInstance } from "$lib/domain/models/CardOld";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { BaseIgnitionEffect } from "$lib/domain/effects/actions/Ignitions/BaseIgnitionEffect";
import { drawStep } from "$lib/domain/effects/steps/draws";
import { removeCounterStep } from "$lib/domain/effects/steps/counters";
import { Card } from "$lib/domain/models/Card";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/** 必要な魔力カウンター数 */
const REQUIRED_SPELL_COUNTERS = 3;

/** 《王立魔法図書館》効果クラス */
export class RoyalMagicalLibraryIgnitionEffect extends BaseIgnitionEffect {
  constructor() {
    super(70791313, 1);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 魔力カウンターが3つ以上であること
   */
  protected individualConditions(_state: GameState, sourceInstance: CardInstance): ValidationResult {
    // 1. 魔力カウンターが3つ以上であること
    const counters = sourceInstance.stateOnField?.counters ?? [];
    const spellCounterCount = Card.Counter.getCounterCount(counters, "spell");
    if (spellCounterCount < REQUIRED_SPELL_COUNTERS) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.INSUFFICIENT_COUNTERS);
    }

    return GameProcessing.Validation.success();
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * コスト:
   * 1. 魔力カウンターを3つ取り除く
   *
   * @protected
   */
  protected individualActivationSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    return [removeCounterStep(sourceInstance.instanceId, "spell", REQUIRED_SPELL_COUNTERS)];
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * 効果:
   * 1. 1枚ドロー
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [drawStep(1)];
  }
}
