/**
 * GenericEquipSpellActivation - DSL定義から生成される装備魔法カード発動効果
 *
 * EquipSpellActivation を拡張し、DSL定義を注入して動作する汎用クラス。
 * 個別のTypeScriptクラスを作成せずに装備魔法カードの効果を定義できる。
 *
 * 早すぎた埋葬のような「墓地からモンスターを対象に取り、蘇生して装備する」カードに対応。
 * DSLのactivationsで対象選択を定義し、resolutionsで蘇生・装備を定義する。
 *
 * @module domain/dsl/factories/GenericEquipSpellActivation
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { EquipSpellActivation } from "$lib/domain/effects/actions/activations/EquipSpellActivation";
import type { ChainableActionDSL, StepDSL, StepBuildContext } from "$lib/domain/dsl/types";
import { buildStep } from "$lib/domain/dsl/steps";
import { checkCondition } from "$lib/domain/dsl/conditions";

/**
 * GenericEquipSpellActivation - DSL定義ベースの装備魔法効果
 *
 * DSLの activations セクションから conditions, activations, resolutions を読み取り、
 * 既存のEquipSpellActivation継承構造に適合させる。
 *
 * 通常の装備魔法（フィールドのモンスターを対象に取る）とは異なり、
 * DSLで対象選択処理を完全にカスタマイズできる。
 */
export class GenericEquipSpellActivation extends EquipSpellActivation {
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
      effectId: this.effectId,
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
    if (!conditions || !conditions.requirements || conditions.requirements.length === 0) {
      return GameProcessing.Validation.success();
    }

    // すべての条件をチェック
    for (const conditionDef of conditions.requirements) {
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
   * コスト支払い処理に使用される。
   * 対象選択もここで行う（DSLで明示的に定義）。
   */
  protected individualActivationSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return this.buildSteps(this.dslDefinition.activations, sourceInstance);
  }

  /**
   * ACTIVATION: 発動後処理（装備魔法共通）をオーバーライド
   *
   * DSLで対象選択を定義している場合は、自動的な対象選択をスキップする。
   * 対象選択は individualActivationSteps で行われる。
   */
  protected override subTypePostActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    // DSLのactivationsで対象選択を定義している場合は、自動対象選択をスキップ
    if (this.dslDefinition.activations && this.dslDefinition.activations.length > 0) {
      return [];
    }
    // activationsが空の場合は親クラスの処理（フィールドのモンスターから選択）を使用
    return super.subTypePostActivationSteps(_state, _sourceInstance);
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
 * DSL定義からGenericEquipSpellActivationを生成する
 *
 * @param cardId - カードID
 * @param dslDefinition - DSLのactivationsセクション
 * @returns GenericEquipSpellActivationインスタンス
 */
export function createGenericEquipSpellActivation(
  cardId: number,
  dslDefinition: ChainableActionDSL,
): GenericEquipSpellActivation {
  return new GenericEquipSpellActivation(cardId, dslDefinition);
}
