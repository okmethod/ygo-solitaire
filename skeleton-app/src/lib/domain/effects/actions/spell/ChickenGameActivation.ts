/**
 * ChickenGameActivation - 《チキンレース》(Chicken Game)
 *
 * Card ID: 67616300 | Type: Spell | Subtype: Field
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、フィールド魔法ゾーンに2枚未満
 * - ACTIVATION: 発動通知
 * - RESOLUTION: フィールド魔法は即座に適用されるため解決ステップなし
 *
 * 永続効果と起動効果は別途ChickenGameContinuousRuleとChickenGameIgnitionEffectで実装
 *
 * @module domain/effects/actions/spell/ChickenGameActivation
 */

import type { GameState } from "../../../models/GameState";
import type { AtomicStep } from "../../../models/AtomicStep";
import { FieldSpellAction } from "../../base/spell/FieldSpellAction";

/**
 * ChickenGameActivation
 *
 * Extends FieldSpellAction for Chicken Game implementation.
 */
export class ChickenGameActivation extends FieldSpellAction {
  constructor() {
    super(67616300);
  }

  /**
   * Card-specific activation conditions
   *
   * - フィールド魔法ゾーンに1枚以下（発動中のカード含む）
   *
   * Note: ActivateSpellCommandはカードをフィールドに移動した後にこのメソッドを呼ぶため、
   * フィールドに既に1枚のフィールド魔法（発動中のカード）がある状態でもtrueを返す必要がある。
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  protected individualConditions(state: GameState): boolean {
    // フィールド魔法が2枚以上ある場合は発動不可
    // （通常は1枚まで、発動中のカードを含めて）
    const fieldSpellCount = state.zones.fieldZone.filter(
      (card) => card.type === "spell" && card.spellType === "field",
    ).length;

    return fieldSpellCount < 2;
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * フィールド魔法は即座に適用されるため、墓地送りステップは不要。
   * 永続効果はAdditionalRuleRegistryのChickenGameContinuousRuleで管理される。
   * 起動効果はChickenGameIgnitionEffectで別途実装される。
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID（未使用）
   * @returns 空配列（解決ステップなし）
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    // Field Spell stays on field, no graveyard step
    // Continuous effect is handled by ChickenGameContinuousRule in AdditionalRuleRegistry
    // Ignition effect is handled by ChickenGameIgnitionEffect
    return [];
  }
}
