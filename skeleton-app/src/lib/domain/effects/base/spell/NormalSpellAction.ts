/**
 * NormalSpellAction - Abstract base class for Normal Spell card activations
 *
 * Extends BaseSpellAction with Normal Spell specific properties:
 * - spellSpeed = 1
 * - Main Phase only activation
 *
 * Normal Spell cards are sent to graveyard after resolution.
 *
 * @module domain/effects/base/spell/NormalSpellAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { BaseSpellAction } from "./BaseSpellAction";

/**
 * NormalSpellAction - Abstract base class for Normal Spell cards
 *
 * @abstract
 * @example
 * ```typescript
 * export class PotOfGreedActivation extends NormalSpellAction {
 *   protected getCardId() { return "55144522"; }
 *   protected getCardName() { return "Pot of Greed"; }
 *   protected getActivationDescription() { return "強欲な壺を発動します"; }
 *
 *   protected additionalActivationConditions(state: GameState): boolean {
 *     return state.zones.deck.length >= 2;
 *   }
 *
 *   createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
 *     return [
 *       createDrawStep(2),
 *       createSendToGraveyardStep(instanceId, "Pot of Greed", "強欲な壺")
 *     ];
 *   }
 * }
 * ```
 */
export abstract class NormalSpellAction extends BaseSpellAction {
  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * Normal Spell specific conditions:
   * - Game must not be over (BaseSpellAction check)
   * - Current phase must be Main1
   * - Card-specific conditions (via additionalActivationConditions)
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  canActivate(state: GameState): boolean {
    // Game must not be over
    if (state.result.isGameOver) {
      return false;
    }

    // Must be Main Phase 1
    if (state.phase !== "Main1") {
      return false;
    }

    // Subclass-specific conditions
    return this.additionalActivationConditions(state);
  }

  /**
   * Card-specific activation conditions
   *
   * Subclasses implement this to add card-specific conditions
   *
   * @param state - 現在のゲーム状態
   * @returns 追加条件を満たすならtrue
   * @protected
   * @abstract
   */
  protected abstract additionalActivationConditions(state: GameState): boolean;

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * Subclasses must implement this to define card-specific resolution steps.
   * Typically includes:
   * 1. Card effect (draw, search, etc.)
   * 2. Send spell card to graveyard (createSendToGraveyardStep)
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   * @abstract
   */
  abstract createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];

  /**
   * Get card ID (used for step IDs)
   * @protected
   * @abstract
   */
  protected abstract getCardId(): string;

  /**
   * Get card name (used for messages)
   * @protected
   * @abstract
   */
  protected abstract getCardName(): string;

  /**
   * Get activation description (used for activation step)
   * @protected
   * @abstract
   */
  protected abstract getActivationDescription(): string;
}
