/**
 * GenericTriggerRule - DSL定義からトリガールールを生成するファクトリ
 *
 * AdditionalRuleインターフェースを実装し、DSL定義に基づいて
 * トリガールールの処理を行う。
 *
 * 例: 王立魔法図書館の永続効果（魔法発動時にカウンターを置く）
 *
 * @module domain/dsl/factories/GenericTriggerRule
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, EventType } from "$lib/domain/models/GameProcessing";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/Effect";
import type { AdditionalRuleDSL } from "$lib/domain/dsl/types";
import { buildStep, type StepBuildContext } from "$lib/domain/effects/steps";

/**
 * GenericTriggerRule - DSL定義に基づくトリガールール実装
 *
 * DSL定義のAdditionalRuleDSLからAdditionalRuleを生成する。
 * TriggerRuleカテゴリに対応し、イベント駆動の処理を行う。
 */
export class GenericTriggerRule implements AdditionalRule {
  /** カードID */
  readonly cardId: number;

  /** 効果である（無効化される可能性がある） */
  readonly isEffect: boolean;

  /** カテゴリ: トリガールール */
  readonly category: RuleCategory;

  /** トリガーイベント */
  readonly triggers: readonly EventType[];

  /** トリガータイミング種別（デフォルト: "if"） */
  readonly triggerTiming: "when" | "if";

  /** 強制効果かどうか（デフォルト: true） */
  readonly isMandatory: boolean;

  /** DSL定義（内部保持） */
  private readonly dslDefinition: AdditionalRuleDSL;

  /**
   * コンストラクタ
   *
   * @param cardId - カードID
   * @param dslDefinition - DSL形式のルール定義
   */
  constructor(cardId: number, dslDefinition: AdditionalRuleDSL) {
    this.cardId = cardId;
    this.dslDefinition = dslDefinition;

    // DSL定義からプロパティを設定
    this.isEffect = true; // TriggerRuleは常に効果
    this.category = dslDefinition.category;
    this.triggers = dslDefinition.triggers ?? [];
    this.triggerTiming = dslDefinition.triggerTiming ?? "if";
    this.isMandatory = dslDefinition.isMandatory ?? true;
  }

  /**
   * 適用条件チェック
   *
   * カードがフィールドに表側表示で存在するかを確認する。
   * TriggerRuleはフィールドにカードが存在する場合のみ適用可能。
   *
   * @param state - 現在のゲーム状態
   * @returns 適用可能ならtrue
   */
  canApply(state: GameSnapshot): boolean {
    // モンスターゾーンに該当カードが表側表示で存在するか
    const onMainMonsterZone = state.space.mainMonsterZone.some(
      (card) => card.id === this.cardId && Card.Instance.isFaceUp(card),
    );

    if (onMainMonsterZone) {
      return true;
    }

    // スペルトラップゾーンに該当カードが表側表示で存在するか（永続魔法等）
    const onSpellTrapZone = state.space.spellTrapZone.some(
      (card) => card.id === this.cardId && Card.Instance.isFaceUp(card),
    );

    if (onSpellTrapZone) {
      return true;
    }

    // フィールドゾーンに該当カードが表側表示で存在するか（フィールド魔法）
    const onFieldZone = state.space.fieldZone.some((card) => card.id === this.cardId && Card.Instance.isFaceUp(card));

    return onFieldZone;
  }

  /**
   * トリガー発動時のステップを生成
   *
   * DSL定義のresolutionsをAtomicStepに変換する。
   *
   * @param _state - 現在のゲーム状態
   * @param sourceInstance - このルールの発生源となるカードインスタンス
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
