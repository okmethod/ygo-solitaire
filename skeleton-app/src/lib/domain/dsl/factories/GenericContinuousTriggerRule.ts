/**
 * GenericContinuousTriggerRule - DSL定義から永続効果のトリガールールを生成するファクトリ
 *
 * BaseContinuousEffectを継承し、DSL定義に基づいて
 * 永続効果のトリガールールの処理を行う。
 *
 * 例: 王立魔法図書館の永続効果（魔法発動時にカウンターを置く）
 *
 * 注: 永続効果以外のトリガー（墓地トリガー、手札誘発等）は別クラスで実装する。
 *
 * @module domain/dsl/factories/GenericContinuousTriggerRule
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, EventType } from "$lib/domain/models/GameProcessing";
import type { RuleCategory } from "$lib/domain/models/Effect";
import type { AdditionalRuleDSL } from "$lib/domain/dsl/types";
import { buildStep, type StepBuildContext } from "$lib/domain/effects/steps";
import { BaseContinuousEffect } from "$lib/domain/effects/rules";

/**
 * GenericContinuousTriggerRule - DSL定義に基づく永続効果のトリガールール実装
 *
 * BaseContinuousEffectを継承し、DSL定義からトリガールールを生成する。
 * フィールドで表側表示の場合のみ適用される永続効果のトリガーを扱う。
 *
 * PSCT準拠の構造:
 * - conditions.trigger: イベント駆動の発火点
 * - conditions.requirements: 状態ベースの条件チェック（将来対応）
 */
export class GenericContinuousTriggerRule extends BaseContinuousEffect {
  /** カテゴリ: トリガールール */
  readonly category: RuleCategory;

  /** トリガーイベント */
  readonly triggers: readonly EventType[];

  /** トリガータイミング種別（デフォルト: "if"） */
  readonly triggerTiming: "when" | "if";

  /** 強制効果かどうか（デフォルト: true） */
  readonly isMandatory: boolean;

  /** 自身が発生源のイベントのみに反応するか（デフォルト: false） */
  readonly selfOnly: boolean;

  /** DSL定義（内部保持） */
  private readonly dslDefinition: AdditionalRuleDSL;

  /**
   * コンストラクタ
   *
   * @param cardId - カードID
   * @param dslDefinition - DSL形式のルール定義
   */
  constructor(cardId: number, dslDefinition: AdditionalRuleDSL) {
    super(cardId);
    this.dslDefinition = dslDefinition;

    // DSL定義からプロパティを設定
    this.category = dslDefinition.category;

    // PSCT準拠構造からトリガー情報を読み取り
    const trigger = dslDefinition.conditions?.trigger;
    this.triggers = trigger?.events ?? [];
    this.triggerTiming = trigger?.timing ?? "if";
    this.isMandatory = trigger?.isMandatory ?? true;
    this.selfOnly = trigger?.selfOnly ?? false;
  }

  /**
   * 適用条件チェック（カード固有）
   *
   * TODO: 将来、DSL定義に適用条件を追加する場合はここで評価する。
   */
  protected individualConditions(_state: GameSnapshot): boolean {
    return true;
  }

  /**
   * トリガー発動時のステップを生成
   *
   * DSL定義のresolutionsをAtomicStepに変換する。
   *
   * @returns 実行するAtomicStep配列
   */
  createTriggerSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    const resolutions = this.dslDefinition.resolutions ?? [];

    const context: StepBuildContext = {
      cardId: this.cardId,
      sourceInstanceId: sourceInstance.instanceId,
    };

    return resolutions.map((stepDsl) => buildStep(stepDsl.step, stepDsl.args ?? {}, context));
  }
}
