/**
 * GenericUnclassifiedActionOverride - 汎用 ActionOverride ルール
 *
 * BaseUnclassifiedEffectを継承し、DSL定義に基づいて
 * 分類されない効果の処理置換を行う。
 *
 * 例: 混沌の黒魔術師の分類されない効果（フィールドを離れると除外される）
 *
 * @module domain/dsl/factories/GenericUnclassifiedActionOverride
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { RuleCategory } from "$lib/domain/models/Effect";
import type { OverrideName } from "$lib/domain/dsl/overrides/OverrideNames";
import type { ActionOverrideHandler } from "$lib/domain/dsl/overrides/ActionOverrideRegistry";
import type { AdditionalRuleDSL, DSLArgs } from "$lib/domain/dsl/types";
import { BaseUnclassifiedEffect } from "$lib/domain/effects/rules/unclassifieds/BaseUnclassifiedEffect";
import { ActionOverrideRegistry } from "$lib/domain/dsl/overrides";

/**
 * GenericUnclassifiedActionOverride - DSL定義に基づく分類されない効果の処理置換実装
 *
 * BaseUnclassifiedEffectを継承し、DSL定義から処理置換を生成する。
 *
 * Override 名と引数を保持し、ActionOverrideRegistry のハンドラに処理を委譲する。
 */
export class GenericUnclassifiedActionOverride extends BaseUnclassifiedEffect {
  /** ルールのカテゴリ */
  readonly category: RuleCategory = "ActionOverride";

  /** Override 名 */
  readonly overrideName: OverrideName;

  /** DSL で指定された引数 */
  readonly args: DSLArgs;

  /** Override ハンドラ */
  private readonly handler: ActionOverrideHandler;

  /**
   * コンストラクタ
   *
   * @param cardId - カード ID
   * @param dslDefinition - DSL形式のルール定義
   * @throws Error - override フィールドが指定されていない場合
   */
  constructor(cardId: number, dslDefinition: AdditionalRuleDSL) {
    super(cardId);

    if (!dslDefinition.override) {
      throw new Error(`ActionOverride rule for card ID ${cardId} requires an "override" field`);
    }

    this.overrideName = dslDefinition.override;
    this.args = dslDefinition.args ?? {};
    this.handler = ActionOverrideRegistry.createHandler(this.overrideName, cardId);
  }

  /**
   * 適用条件チェック（カード固有）
   *
   * 基本的に常に適用可能（実際の判定は shouldApplyOverride で行う）
   */
  protected individualConditions(_state: GameSnapshot): boolean {
    return true;
  }

  /**
   * 指定カードに対してオーバーライドを適用すべきか判定
   *
   * @param state - 現在のゲーム状態
   * @param card - 対象カード
   * @returns 適用すべきなら true
   */
  shouldApplyOverride(state: GameSnapshot, card: CardInstance): boolean {
    return this.handler.shouldApply(state, card, this.args);
  }

  /**
   * オーバーライド値を取得
   *
   * @returns オーバーライド値（型はハンドラに依存）
   */
  getOverrideValue<T>(): T {
    return this.handler.getOverrideValue(this.args) as T;
  }
}
