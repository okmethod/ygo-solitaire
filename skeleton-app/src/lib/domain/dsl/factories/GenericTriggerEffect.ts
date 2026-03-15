/**
 * GenericTriggerEffect - DSL定義から生成される誘発効果
 *
 * BaseTriggerEffect を拡張し、DSL定義を注入して動作する汎用クラス。
 * 個別のTypeScriptクラスを作成せずにモンスターの誘発効果を定義できる。
 *
 * 例: 召喚僧サモンプリーストの誘発効果（召喚成功時に守備表示にする）
 *
 * @module domain/dsl/factories/GenericTriggerEffect
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult, EventType } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { BaseTriggerEffect } from "$lib/domain/effects/actions/triggers/BaseTriggerEffect";
import type { ChainableActionDSL, StepDSL, StepBuildContext } from "$lib/domain/dsl/types";
import { buildStep } from "$lib/domain/dsl/steps";
import { checkCondition } from "$lib/domain/dsl/conditions";

/**
 * GenericTriggerEffect - DSL定義ベースの誘発効果
 *
 * DSLの triggers セクションから conditions（trigger, requirements, usageLimit）,
 * activations, resolutions を読み取り、既存のBaseTriggerEffect継承構造に適合させる。
 *
 * PSCT準拠の構造:
 * - conditions.trigger: イベント駆動の発火点
 * - conditions.requirements: 状態ベースの条件チェック
 * - conditions.usageLimit: 使用制限
 */
export class GenericTriggerEffect extends BaseTriggerEffect {
  /** トリガーイベント */
  readonly triggers: readonly EventType[];

  /** トリガータイミング種別（デフォルト: "if"） */
  readonly triggerTiming: "when" | "if";

  /** 強制効果かどうか（デフォルト: true） */
  readonly isMandatory: boolean;

  /** 自身が発生源のイベントのみに反応するか（デフォルト: false） */
  readonly selfOnly: boolean;

  /** DSL定義（内部保持） */
  private readonly dslDefinition: ChainableActionDSL;

  /**
   * @param cardId - カードID
   * @param effectIndex - 同一カードの誘発効果の番号（1始まり）
   * @param dslDefinition - DSLのtriggersセクションの1要素
   */
  constructor(cardId: number, effectIndex: number, dslDefinition: ChainableActionDSL) {
    // spellSpeed をDSL定義から取得（デフォルト: 1）
    super(cardId, effectIndex, dslDefinition.spellSpeed ?? 1);
    this.dslDefinition = dslDefinition;

    // DSL定義からプロパティを設定（PSCT準拠構造から読み取り）
    const trigger = dslDefinition.conditions?.trigger;
    this.triggers = trigger?.events ?? [];
    this.triggerTiming = trigger?.timing ?? "if";
    this.isMandatory = trigger?.isMandatory ?? true;
    this.selfOnly = trigger?.selfOnly ?? false;
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
   * DSL定義のconditions.requirementsを評価する。
   * すべての条件がパスした場合のみ発動可能。
   *
   * 注: usageLimitは将来的にここで評価する予定。
   */
  protected individualConditions(state: GameSnapshot, sourceInstance: CardInstance): ValidationResult {
    const requirements = this.dslDefinition.conditions?.requirements;

    // 条件が定義されていない場合は常に発動可能
    if (!requirements || requirements.length === 0) {
      return GameProcessing.Validation.success();
    }

    // すべての条件をチェック
    for (const conditionDef of requirements) {
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
 * DSL定義からGenericTriggerEffectを生成する
 *
 * @param cardId - カードID
 * @param effectIndex - 同一カードの誘発効果の番号（1始まり）
 * @param dslDefinition - DSLのtriggersセクションの1要素
 * @returns GenericTriggerEffectインスタンス
 */
export function createGenericTriggerEffect(
  cardId: number,
  effectIndex: number,
  dslDefinition: ChainableActionDSL,
): GenericTriggerEffect {
  return new GenericTriggerEffect(cardId, effectIndex, dslDefinition);
}
