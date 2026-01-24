/**
 * MagicalStoneExcavationActivation - 《魔法石の採掘》(Magical Stone Excavation)
 *
 * Card ID: 98494543 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 捨てられる手札が2枚以上、墓地に魔法カードが1枚以上
 * - ACTIVATION: 手札を2枚捨てる
 * - RESOLUTION: 魔法カード1枚をサルベージ
 *
 * @module domain/effects/actions/spells/individuals/MagicalStoneExcavationActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/actions/spells/NormalSpellAction";
import { countHandExcludingSelf } from "$lib/domain/models/Zone";
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
   * 1. このカードを除き、手札が2枚以上であること
   * 2. 墓地に魔法カードが1枚以上あること
   */
  protected individualConditions(state: GameState, sourceInstance: CardInstance): boolean {
    // 1. このカードを除き、手札が2枚以上であること
    if (countHandExcludingSelf(state.zones, sourceInstance) < 2) {
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
   * ACTIVATION: 発動処理（カード固有）
   *
   * コスト:
   * 1. 手札から2枚を選んで捨てる
   *
   * @protected
   */
  protected individualActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      // 1. 手札から2枚を選んで捨てる
      selectAndDiscardStep(2),
    ];
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * 効果:
   * 1. 魔法カード1枚をサルベージ
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    return [
      // 1. 魔法カード1枚をサルベージ
      salvageFromGraveyardStep({
        id: `magical-stone-excavation-search-${sourceInstance.instanceId}`,
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
