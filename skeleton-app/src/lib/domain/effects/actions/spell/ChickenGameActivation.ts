/**
 * ChickenGameActivation - Chicken Game (チキンレース) Field Spell activation
 *
 * Card Information:
 * - Card ID: 67616300
 * - Card Name: Chicken Game (チキンレース)
 * - Card Type: Field Spell
 * - Effect:
 *   - [永続効果] 相手よりLPが少ないプレイヤーが受けるダメージは0になる (ChickenGameContinuousRuleで実装済み)
 *   - [起動効果] 1ターンに1度、1000LP払って発動できる (ChickenGameIgnitionEffectで実装)
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Main Phase, フィールド魔法ゾーンが空
 * - ACTIVATION: Default activation step (provided by base class)
 * - RESOLUTION: フィールド魔法は即座に適用されるため、解決ステップなし
 *
 * @module domain/effects/actions/spell/ChickenGameActivation
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { FieldSpellAction } from "../../base/spell/FieldSpellAction";

/**
 * ChickenGameActivation - Chicken Game カード発動
 *
 * Extends FieldSpellAction with Chicken Game specific logic.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(67616300, new ChickenGameActivation());
 *
 * // Usage in ActivateSpellCommand
 * const action = ChainableActionRegistry.get(67616300);
 * if (action && action.canActivate(state)) {
 *   const activationSteps = action.createActivationSteps(state);
 *   const resolutionSteps = action.createResolutionSteps(state, instanceId);
 * }
 * ```
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
  protected additionalActivationConditions(state: GameState): boolean {
    // フィールド魔法が2枚以上ある場合は発動不可
    // （通常は1枚まで、発動中のカードを含めて）
    const fieldSpellCount = state.zones.field.filter(
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
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    // Field Spell stays on field, no graveyard step
    // Continuous effect is handled by ChickenGameContinuousRule in AdditionalRuleRegistry
    // Ignition effect is handled by ChickenGameIgnitionEffect
    return [];
  }
}
