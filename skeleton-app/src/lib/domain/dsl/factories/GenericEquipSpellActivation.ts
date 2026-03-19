/**
 * GenericEquipSpellActivation - DSL定義から生成される装備魔法カード発動効果
 *
 * EquipSpellActivation を拡張し、DSL定義を注入して動作する汎用クラス。
 * 個別のTypeScriptクラスを作成せずに装備魔法カードの効果を定義できる。
 *
 * 早すぎた埋葬のような「墓地からモンスターを対象に取り、蘇生して装備する」カードに対応。
 * DSL定義に SELECT_TARGET_* ステップがあれば明示的な対象選択を使用し、
 * ない場合は親クラスの自動対象選択機能を使用する。
 * 装備関係確立は親クラスで自動的に処理される。
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
 * 特徴:
 * - DSL定義に明示的な対象選択ステップ（SELECT_TARGET_*）がある場合は、
 *   親クラスの自動対象選択と対象候補チェックを無効化する。
 * - フィールドのモンスターを対象に取る装備魔法も、墓地や除外ゾーンから
 *   対象を取る装備魔法も、同じ仕組みで定義できる。
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
   * DSL定義に明示的な対象選択ステップがあるかチェック
   *
   * SELECT_TARGET_* で始まるステップ名があれば true を返す。
   */
  private hasExplicitTargetSelection(): boolean {
    return this.dslDefinition.activations?.some((stepDef) => stepDef.step.startsWith("SELECT_TARGET_")) ?? false;
  }

  /**
   * デフォルトの装備対象選択機能を使用するかどうか
   *
   * DSL定義で明示的な対象選択を行う場合は、親クラスのデフォルト機能を無効化する。
   */
  protected override useDefaultEquipTargetSelection(): boolean {
    return !this.hasExplicitTargetSelection();
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
   * ACTIVATIONS: 発動処理（カード固有）
   *
   * DSL定義のactivationsセクションからステップを生成する。
   * コスト支払い、明示的な対象選択などの処理を含む。
   *
   * - SELECT_TARGET_* ステップがある場合: 明示的な対象選択を実行
   * - SELECT_TARGET_* ステップがない場合: 親クラスの自動対象選択が有効
   */
  protected individualActivationSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return this.buildSteps(this.dslDefinition.activations, sourceInstance);
  }

  /**
   * RESOLUTIONS: 効果解決処理（カード固有）
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
