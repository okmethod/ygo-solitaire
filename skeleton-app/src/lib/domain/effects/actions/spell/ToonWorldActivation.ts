/**
 * ToonWorldActivation - 《トゥーン・ワールド》(Toon World)
 *
 * Card ID: 15259703 | Type: Spell | Subtype: Continuous
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、LP>=1000
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 1000LP支払い、フィールドに残る
 *
 * @module domain/effects/actions/spell/ToonWorldActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { ContinuousSpellAction } from "$lib/domain/effects/base/spell/ContinuousSpellAction";
import { payLpStep } from "$lib/domain/effects/steps/lifePoints";

/**
 * ToonWorldActivation
 *
 * Extends ContinuousSpellAction for Toon World implementation.
 */
export class ToonWorldActivation extends ContinuousSpellAction {
  constructor() {
    super(15259703);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. プレイヤーのLPが1000以上であること
   */
  protected individualConditions(state: GameState): boolean {
    // 1. プレイヤーのLPが1000以上であること（発動コスト支払い可能）
    return state.lp.player >= 1000;
  }

  /**
   * RESOLUTION: Pay 1000 LP → Card stays on field (placement handled by ActivateSpellCommand)
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: Pay 1000 LP
      payLpStep(1000, "player"),

      // Note: No graveyard step - Continuous Spells stay on field after activation
    ];
  }
}
