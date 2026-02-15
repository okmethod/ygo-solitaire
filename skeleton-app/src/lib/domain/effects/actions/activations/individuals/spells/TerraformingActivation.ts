/**
 * TerraformingActivation - 《テラ・フォーミング》(Terraforming)
 *
 * Card ID: 73628505 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: デッキにフィールド魔法が1枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: フィールド魔法1枚をサーチ
 *
 * @module domain/effects/actions/spells/individuals/TerraformingActivation
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { NormalSpellAction } from "$lib/domain/effects/actions/activations/NormalSpellAction";
import { searchFromDeckByConditionStep } from "$lib/domain/effects/steps/searches";

/** 《テラ・フォーミング》効果クラス */
export class TerraformingActivation extends NormalSpellAction {
  constructor() {
    super(73628505);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. デッキにフィールド魔法が1枚以上あること
   *
   * @protected
   */
  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    const fieldSpells = state.space.mainDeck.filter((card) => card.type === "spell" && card.spellType === "field");
    if (fieldSpells.length < 1) {
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
   * 1. デッキからフィールド魔法1枚を手札に加える
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return [
      searchFromDeckByConditionStep({
        id: `terraforming-search-${sourceInstance.instanceId}`,
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
