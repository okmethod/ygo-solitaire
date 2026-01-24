/**
 * MagicalStoneExcavationActivation - 《魔法石の採掘》(Magical Stone Excavation)
 *
 * Card ID: 98494543 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 墓地に魔法カードが1枚以上、手札に2枚以上
 * - ACTIVATION: 手札を2枚捨てる
 * - RESOLUTION: 墓地から魔法カード1枚選んで手札に加える、墓地へ送る
 *
 * @module domain/effects/actions/spell/MagicalStoneExcavationActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { selectAndDiscardStep } from "$lib/domain/effects/steps/discards";
import { salvageFromGraveyardStep } from "$lib/domain/effects/steps/searches";

/** 《魔法石の採掘》効果クラス */
export class MagicalStoneExcavationActivation extends NormalSpellAction {
  constructor() {
    super(98494543);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 手札に捨てられるカードが2枚以上あること
   * 2. 墓地に魔法カードが1枚以上あること
   */
  protected individualConditions(state: GameState): boolean {
    // 1. 手札に捨てられるカードが2枚以上あること
    // 手札から発動する場合は、このカード自身を除いた枚数をチェック
    // FIXME: 手札に同名カードが複数ある場合に意図する動作をしない
    const thisCardInHand = state.zones.hand.some((card) => card.id === this.cardId);
    const requiredHandSize = thisCardInHand ? 3 : 2;
    if (state.zones.hand.length < requiredHandSize) {
      return false;
    }

    // 2. 墓地に魔法カードが1枚以上あること
    const spellCardsInGraveyard = state.zones.graveyard.filter((card) => card.type === "spell");
    if (spellCardsInGraveyard.length < 1) {
      return false;
    }

    return true;
  }

  /**
   * RESOLUTION: Discard 2 cards → Select 1 spell from graveyard → Add to hand
   *
   * 効果の流れ:
   * 1. 手札から2枚を選んで墓地へ送る（コスト）
   * 2. 墓地から魔法カード1枚を選んで手札に加える
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: 手札から2枚選んで墓地へ送る（コスト）
      selectAndDiscardStep(2),

      // Step 2: 墓地から魔法カード1枚を選んで手札に加える
      salvageFromGraveyardStep({
        id: `magical-stone-excavation-search-${activatedCardInstanceId}`,
        summary: "魔法カード1枚をサルベージ",
        description: "墓地から魔法カード1枚を選択し、手札に加えます",
        filter: (card) => card.type === "spell",
        minCards: 1,
        maxCards: 1,
        cancelable: false,
      }),
    ];
  }
}
