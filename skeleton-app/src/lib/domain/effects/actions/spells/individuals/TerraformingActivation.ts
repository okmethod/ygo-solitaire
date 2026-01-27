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

import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import {
  successValidationResult,
  failureValidationResult,
  ValidationErrorCode,
} from "$lib/domain/models/ValidationResult";
import { NormalSpellAction } from "$lib/domain/effects/actions/spells/NormalSpellAction";
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
  protected individualConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
    const fieldSpells = state.zones.deck.filter((card) => card.type === "spell" && card.spellType === "field");
    if (fieldSpells.length < 1) {
      return failureValidationResult(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
    }
    return successValidationResult();
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   */
  protected individualActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
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
  protected individualResolutionSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[] {
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
