/**
 * AdditionalRuleRegistry - 追加ルールのレジストリ
 *
 * Card ID → AdditionalRule[] のマッピングを管理
 * Registry Pattern
 * - 1枚のカードに複数のルールを登録可能
 * - カテゴリ別フィルタ機能
 * - フィールド全体から適用可能なルールを収集
 *
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { AdditionalRule, RuleCategory } from "../models/AdditionalRule";
import type { RuleContext } from "../models/RuleContext";
import type { GameState } from "../models/GameState";

/**
 * AdditionalRuleRegistry クラス
 *
 * カードIDをキーとして AdditionalRule[] を管理する。
 * 1枚のカードに複数のルールを登録可能。
 */
export class AdditionalRuleRegistry {
  /**
   * ルールのマップ (Card ID → AdditionalRule[])
   * @private
   */
  private static rules = new Map<number, AdditionalRule[]>();

  /**
   * ルールを登録
   *
   * @param cardId - カードID（Card Data ID）
   * @param rule - 追加ルール
   */
  static register(cardId: number, rule: AdditionalRule): void {
    const existing = this.rules.get(cardId) || [];
    this.rules.set(cardId, [...existing, rule]);
  }

  /**
   * カードIDから全ルールを取得
   *
   * @param cardId - カードID
   * @returns AdditionalRule配列（未登録の場合は空配列）
   */
  static get(cardId: number): AdditionalRule[] {
    return this.rules.get(cardId) || [];
  }

  /**
   * カテゴリ別フィルタ
   *
   * @param cardId - カードID
   * @param category - ルールカテゴリ
   * @returns 該当カテゴリのルール配列
   */
  static getByCategory(cardId: number, category: RuleCategory): AdditionalRule[] {
    const allRules = this.get(cardId);
    return allRules.filter((rule) => rule.category === category);
  }

  /**
   * フィールド全体から適用可能なルールを収集
   *
   * フィールド上のすべてのカードをチェックし、
   * 指定カテゴリのルールで canApply() が true のものを収集する。
   *
   * @param state - 現在のゲーム状態
   * @param category - ルールカテゴリ
   * @param context - ルール適用コンテキスト
   * @returns 適用可能なルール配列
   */
  static collectActiveRules(state: GameState, category: RuleCategory, context: RuleContext = {}): AdditionalRule[] {
    const activeRules: AdditionalRule[] = [];

    // フィールド上のすべてのカードをチェック（魔法・罠ゾーンとフィールド魔法ゾーン）
    const fieldCards = [...state.zones.spellTrapZone, ...state.zones.fieldZone];
    for (const card of fieldCards) {
      // 表側表示のカードのみチェック
      if (card.position !== "faceUp") continue;

      const cardRules = this.getByCategory(card.id, category);
      for (const rule of cardRules) {
        if (rule.canApply(state, context)) {
          activeRules.push(rule);
        }
      }
    }

    return activeRules;
  }

  /**
   * レジストリをクリア（テスト用）
   */
  static clear(): void {
    this.rules.clear();
  }

  /**
   * 登録済みカードIDの一覧を取得（デバッグ用）
   *
   * @returns 登録済みカードID配列
   */
  static getRegisteredCardIds(): number[] {
    return Array.from(this.rules.keys());
  }
}
