/**
 * TerraformingActivation - 《テラ・フォーミング》(Terraforming)
 *
 * Card ID: 73628505 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、デッキにフィールド魔法が1枚以上
 * - ACTIVATION: 発動通知のみ
 * - RESOLUTION: デッキからフィールド魔法1枚を選択、手札に加える、墓地へ送る
 *
 * @module domain/effects/actions/spell/TerraformingActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { searchFromDeckByConditionStep } from "$lib/domain/effects/steps/searches";

/**
 * TerraformingActivation - デッキからフィールド魔法1枚を手札に加える
 */
export class TerraformingActivation extends NormalSpellAction {
  constructor() {
    super(73628505);
  }

  protected individualConditions(state: GameState): boolean {
    const fieldSpells = state.zones.deck.filter((card) => card.type === "spell" && card.spellType === "field");
    return fieldSpells.length >= 1;
  }

  /**
   * RESOLUTION: デッキからフィールド魔法を選択 → 手札に加える → デッキシャッフル
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: デッキからフィールド魔法を選択して手札に加える
      searchFromDeckByConditionStep({
        id: `terraforming-search-${activatedCardInstanceId}`,
        summary: "フィールド魔法1枚をサーチ",
        description: "デッキからフィールド魔法1枚を選択し、手札に加えます",
        filter: (card) => card.type === "spell" && card.spellType === "field",
        minCards: 1,
        maxCards: 1,
        cancelable: false,
      }),
    ];
  }
}
