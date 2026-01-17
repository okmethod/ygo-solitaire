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

import type { GameState } from "../../../models/GameState";
import type { AtomicStep } from "../../../models/AtomicStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createCardSelectionStep, createShuffleStep } from "../../builders/stepBuilders";
import { moveCard } from "../../../models/Zone";

/**
 * TerraformingActivation - デッキからフィールド魔法1枚を手札に加える
 */
export class TerraformingActivation extends NormalSpellAction {
  constructor() {
    super(73628505);
  }

  protected additionalActivationConditions(state: GameState): boolean {
    const fieldSpells = state.zones.deck.filter((card) => card.type === "spell" && card.spellType === "field");
    return fieldSpells.length >= 1;
  }

  /**
   * RESOLUTION: デッキからフィールド魔法を選択 → 手札に加える → デッキシャッフル
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createResolutionSteps(state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    const fieldSpells = state.zones.deck.filter((card) => card.type === "spell" && card.spellType === "field");

    return [
      // Step 1: デッキからフィールド魔法を選択して手札に加える
      createCardSelectionStep({
        id: "terraforming-select",
        summary: "フィールド魔法を選択",
        description: "デッキからフィールド魔法1枚を選択してください",
        availableCards: fieldSpells,
        minCards: 1,
        maxCards: 1,
        cancelable: false,
        onSelect: (currentState, selectedIds) => {
          if (selectedIds.length !== 1) {
            return {
              success: false,
              updatedState: currentState,
              error: "Must select exactly 1 Field Spell from deck",
            };
          }

          const updatedZones = moveCard(currentState.zones, selectedIds[0], "deck", "hand");
          return {
            success: true,
            updatedState: { ...currentState, zones: updatedZones },
            message: "Added 1 Field Spell from deck to hand",
          };
        },
      }),

      // Step 2: デッキをシャッフル（デッキサーチ後の標準処理）
      createShuffleStep(),
    ];
  }
}
