/**
 * FieldSpellAction - Abstract base class for Field Spell card activations
 *
 * Extends BaseSpellAction with Field Spell specific properties:
 * - spellSpeed = 1
 * - Main Phase only activation
 * - Stays on field (not sent to graveyard after resolution)
 *
 * Field Spells stay on the field and provide continuous effects.
 * Activation is handled by ActivateSpellCommand (places card on field).
 *
 * @module domain/effects/base/spell/FieldSpellAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { BaseSpellAction } from "./BaseSpellAction";

/**
 * FieldSpellAction - Abstract base class for Field Spell cards
 *
 * @abstract
 * @example
 * ```typescript
 * export class ChickenGameActivation extends FieldSpellAction {
 *   protected getCardId() { return "67616300"; }
 *   protected getCardName() { return "Chicken Game"; }
 *   protected getActivationDescription() { return "チキンレースを発動します"; }
 *
 *   protected additionalActivationConditions(state: GameState): boolean {
 *     return true; // No additional conditions
 *   }
 *
 *   createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
 *     return []; // Field Spells typically have no resolution steps (only continuous effects)
 *   }
 * }
 * ```
 */
export abstract class FieldSpellAction extends BaseSpellAction {
  /** スペルスピード1（フィールド魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * Field Spell specific conditions:
   * - Game must not be over (checked by BaseSpellAction)
   * - Current phase must be Main1
   * - Card-specific conditions (via additionalActivationConditions)
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  canActivate(state: GameState): boolean {
    // Check base conditions (game over)
    if (!super.canActivate(state)) {
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
   * Field Spells typically have empty resolution steps (only continuous effects).
   * Activation places card on field, no graveyard step needed.
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
