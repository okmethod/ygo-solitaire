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

import type { AdditionalRule, RuleCategory } from "$lib/domain/models/AdditionalRule";
import type { RuleContext } from "$lib/domain/models/RuleContext";
import type { GameState } from "$lib/domain/models/GameState";
import { isFaceUp } from "$lib/domain/models/Card";

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
  static collectActiveRules(state: GameState, category: RuleCategory, context: RuleContext = {}): AdditionalRule[] {
    const activeRules: AdditionalRule[] = [];

    // フィールド上のすべてのカードをチェック（魔法・罠ゾーンとフィールド魔法ゾーン）
    const fieldCards = [...state.zones.spellTrapZone, ...state.zones.fieldZone];
    for (const card of fieldCards) {
      // 表側表示のカードのみチェック
      if (!isFaceUp(card)) continue;

      const cardRules = this.getByCategory(card.id, category);
      for (const rule of cardRules) {
        if (rule.canApply(state, context)) {
          activeRules.push(rule);
        }
      }
    }

    return activeRules;
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
