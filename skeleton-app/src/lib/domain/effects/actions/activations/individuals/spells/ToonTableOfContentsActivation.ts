/**
 * ToonTableOfContentsActivation - 《トゥーンのもくじ》(Toon Table of Contents)
 *
 * Card ID: 89997728 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: デッキに「トゥーン」カードが1枚以上
 * - ACTIVATION: 無し
 * - RESOLUTION: 「トゥーン」カード1枚をサーチ
 *
 * @module domain/effects/actions/spells/individuals/ToonTableOfContentsActivation
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
import { NormalSpellAction } from "$lib/domain/effects/actions/activations/NormalSpellAction";
import { searchFromDeckByConditionStep } from "$lib/domain/effects/steps/searches";

/** 《トゥーンのもくじ》効果クラス */
export class ToonTableOfContentsActivation extends NormalSpellAction {
  constructor() {
    super(89997728);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. デッキに「トゥーン」カードが1枚以上あること
   *
   * @protected
   */
  protected individualConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
    const toonCardsInDeck = state.zones.deck.filter((card) => card.jaName.includes("トゥーン"));
    if (toonCardsInDeck.length < 1) {
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
   * 効果: デッキから「トゥーン」カード1枚を手札に加える
   *
   * @protected
   */
  protected individualResolutionSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    return [
      searchFromDeckByConditionStep({
        id: `toon-table-search-${sourceInstance.instanceId}`,
        summary: "「トゥーン」カード1枚をサーチ",
        description: "デッキから「トゥーン」カード1枚を選択し、手札に加えます",
        filter: (card) => card.jaName.includes("トゥーン"),
        minCards: 1,
        maxCards: 1,
        cancelable: false,
      }),
    ];
  }
}
