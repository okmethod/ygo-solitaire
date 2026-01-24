/**
 * PotOfDualityActivation - 《強欲で謙虚な壺》(Pot of Duality)
 *
 * Card ID: 98645731 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 1ターンに1度制限、デッキに3枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: デッキトップ3枚確認、1枚選んで手札に加える、残りをデッキに戻す、墓地へ送る
 *
 * @module domain/effects/actions/spell/PotOfDualityActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { searchFromDeckTopStep } from "$lib/domain/effects/steps/searches";
import { shuffleDeckStep } from "$lib/domain/effects/steps/deckOperations";

/** 《強欲で謙虚な壺》効果クラス */
export class PotOfDualityActivation extends NormalSpellAction {
  constructor() {
    super(98645731);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 1ターンに1度制限をクリアしていること
   * 2. デッキに3枚以上あること
   */
  protected individualConditions(state: GameState): boolean {
    // 1. 1ターンに1度制限: 既にこのターン発動済みでないかチェック
    if (state.activatedOncePerTurnCards.has(this.cardId)) {
      return false;
    }

    // 2. デッキに3枚以上あること
    if (state.zones.deck.length < 3) {
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
   * 1. デッキトップ3枚を確認し、1枚を手札に加える
   * 2. デッキをシャッフルする
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      // 1. デッキトップ3枚を確認し、1枚を手札に加える
      searchFromDeckTopStep({
        id: `pot-of-duality-search-${activatedCardInstanceId}`,
        summary: "デッキトップ3枚から1枚をサーチ",
        description: "デッキトップ3枚から1枚を選択し、手札に加えます",
        count: 3,
        minCards: 1,
        maxCards: 1,
        cancelable: false,
      }),

      // 2. デッキをシャッフルする
      shuffleDeckStep(),
    ];
  }
}
