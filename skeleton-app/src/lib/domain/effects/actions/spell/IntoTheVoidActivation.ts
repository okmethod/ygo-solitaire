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
 * @module domain/effects/actions/spell/IntoTheVoidActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
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
  protected individualConditions(state: GameState): boolean {
    // 1. 自分の手札が3枚以上であること
    // 手札から発動する場合は、このカード自身を除いた枚数をチェックする必要がある
    // FIXME: 要検討

    // 2. デッキに1枚以上あること
    if (state.zones.deck.length < 1) {
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
   * 1. 1枚ドロー
   * 2. エンドフェイズに手札を全て捨てる効果を登録
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [drawStep(1), discardAllHandEndPhaseStep()];
  }
}
