/**
 * BaseUnclassifiedEffect - 分類されない効果の抽象基底クラス
 *
 * 分類されない効果はフィールドに限らず手札・墓地などでも適用される場合がある。
 *
 * @module domain/effects/rules/BaseUnclassifiedEffect
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/Effect";

/**
 * BaseUnclassifiedEffect - 分類されない効果の抽象基底クラス
 *
 * AdditionalRuleインターフェースを実装し、分類されない効果共通のロジックを提供する。
 *
 * @abstract
 */
export abstract class BaseUnclassifiedEffect implements AdditionalRule {
  /** カードID */
  readonly cardId: number;

  /** 効果である（無効化される可能性がある） */
  readonly isEffect: boolean = true;

  /** ルールのカテゴリ（サブクラスで指定） */
  abstract readonly category: RuleCategory;

  /**
   * コンストラクタ
   *
   * @param cardId - カードID
   */
  constructor(cardId: number) {
    this.cardId = cardId;
  }

  /**
   * 適用条件チェック（分類されない効果共通）
   *
   * Template Method パターン
   * - このメソッドは final として扱う。
   * - サブクラスで抽象メソッドを実装する。
   *
   * チェック項目:
   * 1. カード固有の適用条件
   *
   * @final このメソッドはオーバーライドしない
   */
  canApply(state: GameSnapshot): boolean {
    // 1. カード固有の適用条件チェック
    return this.individualConditions(state);
  }

  /**
   * 適用条件チェック（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualConditions(state: GameSnapshot): boolean;
}
