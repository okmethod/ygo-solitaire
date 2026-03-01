/**
 * BaseContinuousEffect - 永続効果の抽象基底クラス
 *
 * 永続効果はフィールドで表側表示の場合のみ適用される。
 *
 * @module domain/effects/rules/BaseContinuousEffect
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/Effect";
import { Card } from "$lib/domain/models/Card";

/**
 * BaseContinuousEffect - 永続効果の抽象基底クラス
 *
 * AdditionalRuleインターフェースを実装し、永続効果共通のロジックを提供する。
 * フィールドで表側表示の場合のみ canApply が true を返す。
 *
 * @abstract
 */
export abstract class BaseContinuousEffect implements AdditionalRule {
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
   * 適用条件チェック（永続効果共通）
   *
   * Template Method パターン
   * - このメソッドは final として扱う。
   * - サブクラスで抽象メソッドを実装する。
   *
   * チェック項目:
   * 1. 永続効果共通: フィールドに表側表示で存在するか
   * 2. カード固有の適用条件
   *
   * @final このメソッドはオーバーライドしない
   */
  canApply(state: GameSnapshot): boolean {
    // 1. 永続効果共通: フィールドに表側表示で存在するかチェック
    if (!this.isOnFieldFaceUp(state)) {
      return false;
    }

    // 2. カード固有の適用条件チェック
    return this.individualConditions(state);
  }

  /**
   * フィールドに表側表示で存在するかチェック（永続効果共通）
   *
   * チェック対象:
   * - メインモンスターゾーン
   * - 魔法・罠ゾーン
   * - フィールドゾーン
   */
  protected isOnFieldFaceUp(state: GameSnapshot): boolean {
    // フィールド上のカードインスタンスを収集
    const allFieldCards = [...state.space.mainMonsterZone, ...state.space.spellTrapZone, ...state.space.fieldZone];
    // カードIDが一致し、かつ表側表示であるカードが存在するかチェック
    return allFieldCards.some((card) => card.id === this.cardId && Card.Instance.isFaceUp(card));
  }

  /**
   * 適用条件チェック（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualConditions(state: GameSnapshot): boolean;
}
