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
import type { AtomicStep } from "../../../models/AtomicStep";
import { BaseSpellAction } from "./BaseSpellAction";

/**
 * NormalSpellAction - Abstract base class for Normal Spell cards
 *
 * @abstract
 * @example
 * ```typescript
 * export class PotOfGreedActivation extends NormalSpellAction {
 *   constructor() {
 *     super(55144522, "Pot of Greed");
 *   }
 *
 *   protected additionalActivationConditions(state: GameState): boolean {
 *     return state.zones.deck.length >= 2;
 *   }
 *
 *   createResolutionSteps(state: GameState, instanceId: string): AtomicStep[] {
 *     return [createDrawStep(2)];
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
   * Note: Sending the spell card to graveyard is handled automatically by the framework.
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   * @abstract
   */
  abstract createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];
}
