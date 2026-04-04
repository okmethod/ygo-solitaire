/**
 * AdditionalRuleRegistry - 追加適用するルールのレジストリ
 *
 * Card ID → AdditionalRule[] のマッピングを管理
 *
 * Registry Pattern
 * - 効果の一元管理と、交換しやすい実装
 * - 1枚のカードに複数のルールを登録可能
 * - カテゴリ別フィルタ機能
 * - フィールド全体から適用可能なルールを収集
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, EventType, GameEvent } from "$lib/domain/models/GameProcessing";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/Effect";

/**
 * 追加適用するルールのレジストリ（クラス）
 *
 * カードIDをキーとして AdditionalRule[] を管理する。
 * 1枚のカードに複数のルールを登録可能。
 */
export class AdditionalRuleRegistry {
  /** 追加適用するルールのマップ (Card ID → AdditionalRule[]) */
  private static rules = new Map<number, AdditionalRule[]>();

  /** 追加適用するルールを登録する */
  static register(cardId: number, rule: AdditionalRule): void {
    const existing = this.rules.get(cardId) || [];
    this.rules.set(cardId, [...existing, rule]);
  }

  /** カードIDから追加適用するルールを取得する */
  static get(cardId: number): AdditionalRule[] {
    return this.rules.get(cardId) || [];
  }

  /** ルールカテゴリでフィルタして取得する */
  static getByCategory(cardId: number, category: RuleCategory): AdditionalRule[] {
    const allRules = this.get(cardId);
    return allRules.filter((rule) => rule.category === category);
  }

  /** フィールド全体から適用可能なルールを収集する
   *
   * フィールド上のすべてのカードをチェックし、
   * 指定カテゴリのルールで canApply() が true のものを収集する。
   */
  static collectActiveRules(state: GameSnapshot, category: RuleCategory): AdditionalRule[] {
    const activeRules: AdditionalRule[] = [];

    // フィールド上のすべてのカードをチェック（魔法・罠ゾーンとフィールド魔法ゾーン）
    const fieldCards = [...state.space.spellTrapZone, ...state.space.fieldZone];
    for (const card of fieldCards) {
      // 表側表示のカードのみチェック
      if (!Card.Instance.isFaceUp(card)) continue;

      const cardRules = this.getByCategory(card.id, category);
      for (const rule of cardRules) {
        if (rule.canApply(state)) {
          activeRules.push(rule);
        }
      }
    }

    return activeRules;
  }

  /**
   * 指定イベントに反応するトリガールールを収集する
   *
   * フィールド上のすべてのカードをチェックし、
   * 指定イベントに反応するTriggerRuleを収集する。
   * 各ルールには発生源のカードインスタンスを紐付ける。
   */
  static collectTriggerRules(
    state: GameSnapshot,
    event: EventType,
  ): Array<{ rule: AdditionalRule; sourceInstance: CardInstance }> {
    const results: Array<{ rule: AdditionalRule; sourceInstance: CardInstance }> = [];

    // フィールド上のすべてのカードをチェック（モンスターゾーン、魔法・罠ゾーン、フィールド魔法ゾーン）
    const fieldCards = [...state.space.mainMonsterZone, ...state.space.spellTrapZone, ...state.space.fieldZone];

    for (const card of fieldCards) {
      // 表側表示のカードのみチェック
      if (!Card.Instance.isFaceUp(card)) continue;

      const cardRules = this.getByCategory(card.id, "TriggerRule");
      for (const rule of cardRules) {
        // このイベントに反応するルールかチェック
        if (rule.triggers?.includes(event)) {
          results.push({ rule, sourceInstance: card });
        }
      }
    }

    return results;
  }

  /**
   * 指定イベントに対するトリガールールのステップを収集する
   *
   * - 強制効果（isMandatory: true またはデフォルト）: mandatorySteps に追加
   * - 任意効果（isMandatory: false）: optionalEffects に追加（確認UI経由で発動）
   */
  static collectTriggerSteps(
    state: GameSnapshot,
    event: GameEvent,
  ): {
    mandatorySteps: AtomicStep[];
    optionalEffects: Array<{ instance: CardInstance; steps: AtomicStep[] }>;
  } {
    const triggerRules = this.collectTriggerRules(state, event.type);
    const mandatorySteps: AtomicStep[] = [];
    const optionalEffects: Array<{ instance: CardInstance; steps: AtomicStep[] }> = [];

    for (const { rule, sourceInstance } of triggerRules) {
      // canApply で適用可能かチェック
      if (!rule.canApply(state) || !rule.createTriggerSteps) {
        continue;
      }

      // selfOnly の場合、イベントの発生源と自身が一致するかチェック
      if (rule.selfOnly && event.sourceInstanceId !== sourceInstance.instanceId) {
        continue;
      }

      // excludeSelf の場合、イベントの発生源が自身であれば除外
      if (rule.excludeSelf && event.sourceInstanceId === sourceInstance.instanceId) {
        continue;
      }

      // triggerSourceZones が指定されている場合、発生源ゾーンをフィルタ
      if (rule.triggerSourceZones && !rule.triggerSourceZones.includes(event.sourceInstanceLocation!)) {
        continue;
      }

      // 各ルールにステップ生成を委譲
      const ruleSteps = rule.createTriggerSteps(state, sourceInstance);

      if (rule.isMandatory === false) {
        // 任意効果: 確認UI経由で発動
        optionalEffects.push({ instance: sourceInstance, steps: ruleSteps });
      } else {
        // 強制効果（デフォルト true）: 即座に実行
        mandatorySteps.push(...ruleSteps);
      }
    }

    return { mandatorySteps, optionalEffects };
  }

  /** レジストリをクリアする（テスト用） */
  static clear(): void {
    this.rules.clear();
  }

  /** 登録済みカードIDの一覧を取得する（デバッグ用） */
  static getRegisteredCardIds(): number[] {
    return Array.from(this.rules.keys());
  }
}
