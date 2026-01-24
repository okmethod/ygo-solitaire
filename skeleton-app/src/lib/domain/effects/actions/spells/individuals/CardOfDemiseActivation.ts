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

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/actions/spells/NormalSpellAction";
import { fillHandsStep } from "$lib/domain/effects/steps/draws";
import { discardAllHandEndPhaseStep } from "$lib/domain/effects/steps/discards";

/** 《命削りの宝札》効果クラス */
export class CardOfDemiseActivation extends NormalSpellAction {
  constructor() {
    super(59750328);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 1ターンに1度制限をクリアしていること
   */
  protected individualConditions(state: GameState): boolean {
    // 1. 1ターンに1度制限: 既にこのターン発動済みでないかチェック
    if (state.activatedOncePerTurnCards.has(this.cardId)) {
      return false;
    }

    return true;
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   */
  protected individualActivationSteps(_state: GameState): AtomicStep[] {
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
  protected individualResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [fillHandsStep(3), discardAllHandEndPhaseStep()];
  }
}
