/**
 * QuickPlaySpellAction - Abstract base class for Quick-Play Spell card activations
 *
 * Extends BaseSpellAction with Quick-Play Spell specific properties:
 * - spellSpeed = 2
 * - Can be activated in any phase (no phase restrictions)
 *
 * Note: Current game scope only includes player's Main1 phase, but the abstraction
 * correctly allows activation in any phase to maintain proper semantics.
 *
 * @module domain/effects/base/spell/QuickPlaySpellAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { BaseSpellAction } from "./BaseSpellAction";

/**
 * QuickPlaySpellAction - Abstract base class for Quick-Play Spell cards
 *
 * @abstract
 * @example
 * ```typescript
 * export class CardDestructionActivation extends QuickPlaySpellAction {
 *   protected getCardId() { return "72892473"; }
 *   protected getCardName() { return "Card Destruction"; }
 *   protected getActivationDescription() { return "手札抹殺を発動します"; }
 *
 *   protected additionalActivationConditions(state: GameState): boolean {
 *     return state.zones.hand.length > 0;
 *   }
 *
 *   createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
 *     // Implementation...
 *   }
 * }
 * ```
 */
export abstract class QuickPlaySpellAction extends BaseSpellAction {
  /** スペルスピード2（速攻魔法） */
  readonly spellSpeed = 2 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * Quick-Play Spell specific conditions:
   * - Game must not be over (checked by BaseSpellAction)
   * - Card-specific conditions (via additionalActivationConditions)
   *
   * Note: Quick-Play Spells can be activated in any phase.
   * For current scope (player's turn only), this is Main1, but the abstraction
   * doesn't enforce phase restrictions to maintain correct semantics.
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  canActivate(state: GameState): boolean {
    // Check base conditions (game over) and card-specific conditions
    return super.canActivate(state);
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
