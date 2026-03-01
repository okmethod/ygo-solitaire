/**
 * GenericNormalSpellActivation - DSL定義から生成される通常魔法カード発動効果
 *
 * NormalSpellActivation を拡張し、DSL定義を注入して動作する汎用クラス。
 * 個別のTypeScriptクラスを作成せずに通常魔法カードの効果を定義できる。
 *
 * @module domain/dsl/factories/GenericNormalSpellActivation
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import type { ChainableActionDSL, StepDSL } from "$lib/domain/dsl/types";
import { buildStep, type StepBuildContext } from "$lib/domain/effects/steps";
import { checkCondition } from "$lib/domain/dsl/registries/ConditionRegistry";

/**
 * GenericNormalSpellActivation - DSL定義ベースの通常魔法効果
 *
 * DSLの activations セクションから conditions, activations, resolutions を読み取り、
 * 既存のNormalSpellActivation継承構造に適合させる。
 */
export class GenericNormalSpellActivation extends NormalSpellActivation {
  private readonly dslDefinition: ChainableActionDSL;

  /**
   * @param cardId - カードID
   * @param dslDefinition - DSLのactivationsセクション
   */
  constructor(cardId: number, dslDefinition: ChainableActionDSL) {
    super(cardId);
    this.dslDefinition = dslDefinition;
  }

  /**
   * DSLのStepDSL配列からAtomicStep配列を生成する
   */
  private buildSteps(stepDefs: readonly StepDSL[] | undefined, sourceInstance: CardInstance): AtomicStep[] {
    if (!stepDefs || stepDefs.length === 0) {
      return [];
    }

    const context: StepBuildContext = {
      cardId: this.cardId,
      sourceInstanceId: sourceInstance.instanceId,
    };

    return stepDefs.map((stepDef) => buildStep(stepDef.step, stepDef.args ?? {}, context));
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * DSL定義のconditionsセクションを評価する。
   * すべての条件がパスした場合のみ発動可能。
   */
  protected individualConditions(state: GameSnapshot, sourceInstance: CardInstance): ValidationResult {
    const conditions = this.dslDefinition.conditions;

    // 条件が定義されていない場合は常に発動可能
    if (!conditions || conditions.length === 0) {
      return GameProcessing.Validation.success();
    }

    // すべての条件をチェック
    for (const conditionDef of conditions) {
      const result = checkCondition(conditionDef.step, state, sourceInstance, conditionDef.args ?? {});

      if (!result.isValid) {
        return result;
      }
    }

    return GameProcessing.Validation.success();
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * DSL定義のactivationsセクションからステップを生成する。
   * 主にコスト支払い処理に使用される。
   */
  protected individualActivationSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return this.buildSteps(this.dslDefinition.activations, sourceInstance);
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * DSL定義のresolutionsセクションからステップを生成する。
   * メインの効果処理を定義する。
   */
  protected individualResolutionSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return this.buildSteps(this.dslDefinition.resolutions, sourceInstance);
  }
}

/**
 * DSL定義からGenericNormalSpellActivationを生成する
 *
 * @param cardId - カードID
 * @param dslDefinition - DSLのactivationsセクション
 * @returns GenericNormalSpellActivationインスタンス
 */
export function createGenericNormalSpellActivation(
  cardId: number,
  dslDefinition: ChainableActionDSL,
): GenericNormalSpellActivation {
  return new GenericNormalSpellActivation(cardId, dslDefinition);
}
