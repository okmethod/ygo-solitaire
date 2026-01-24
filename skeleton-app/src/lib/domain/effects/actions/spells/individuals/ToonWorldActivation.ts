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

import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { ContinuousSpellAction } from "$lib/domain/effects/actions/spells/ContinuousSpellAction";
import { payLpStep } from "$lib/domain/effects/steps/lifePoints";

/** 《トゥーン・ワールド》効果クラス */
export class ToonWorldActivation extends ContinuousSpellAction {
  constructor() {
    super(15259703);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. プレイヤーのLPが1000以上であること
   */
  protected individualConditions(state: GameState, _sourceInstance: CardInstance): boolean {
    // 1. プレイヤーのLPが1000以上であること
    if (state.lp.player < 1000) {
      return false;
    }

    return true;
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * コスト: 1000LP支払う
   *
   * @protected
   */
  protected individualActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [payLpStep(1000, "player")];
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 固有ステップ無し
  }
}
