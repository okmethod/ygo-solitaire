/**
 * ContinuousSpellAction - Abstract base class for Continuous Spell card activations
 *
 * Extends BaseSpellAction with Continuous Spell specific properties:
 * - spellSpeed = 1
 * - Main Phase only activation
 * - Stays on field (not sent to graveyard after resolution)
 *
 * Continuous Spells stay on the field and provide continuous effects.
 * Activation is handled by ActivateSpellCommand (places card on field).
 *
 * @module domain/effects/base/spell/ContinuousSpellAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { BaseSpellAction } from "./BaseSpellAction";

/**
 * ContinuousSpellAction - Abstract base class for Continuous Spell cards
 *
 * @abstract
 * @example
 * ```typescript
 * export class ToonWorldActivation extends ContinuousSpellAction {
 *   constructor() {
 *     super(15259703);
 *   }
 *
 *   protected additionalActivationConditions(state: GameState): boolean {
 *     return state.lp.player >= 1000; // Need 1000 LP to activate
 *   }
 *
 *   createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
 *     return [
 *       createLPPaymentStep(1000, { ... })
 *     ];
 *   }
 * }
 * ```
 */
export abstract class ContinuousSpellAction extends BaseSpellAction {
  /** スペルスピード1（永続魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * Continuous Spell specific conditions:
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
   * ACTIVATION: 発動時の処理
   *
   * Continuous Spells have no activation steps (placement handled by ActivateSpellCommand).
   * Override base class to return empty array.
   *
   * @param state - 現在のゲーム状態
   * @returns 空配列（発動時の処理なし）
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createActivationSteps(state: GameState): EffectResolutionStep[] {
    // Continuous Spell has no activation steps (placement handled by ActivateSpellCommand)
    return [];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * Subclasses must implement this to define card-specific resolution steps.
   * Continuous Spells may have activation costs or initial effects.
   * Activation places card on field, no graveyard step needed.
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   * @abstract
   */
  abstract createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
}
