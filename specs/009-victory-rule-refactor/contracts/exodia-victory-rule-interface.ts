/**
 * ExodiaVictoryRule - Interface Contract
 *
 * このファイルは、ExodiaVictoryRuleの型定義とコントラクトを定義します。
 * 実装は skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts で行われます。
 *
 * @see specs/009-victory-rule-refactor/data-model.md
 */

import type { AdditionalRule, RuleCategory } from "../../../../skeleton-app/src/lib/domain/models/AdditionalRule";
import type { RuleContext } from "../../../../skeleton-app/src/lib/domain/models/RuleContext";
import type { GameState } from "../../../../skeleton-app/src/lib/domain/models/GameState";

/**
 * ExodiaVictoryRule インターフェース
 *
 * エクゾディアの特殊勝利条件を実装するためのコントラクト。
 * AdditionalRuleインターフェースを実装する。
 */
export interface IExodiaVictoryRule extends AdditionalRule {
  /**
   * 効果外テキストである（無効化されない）
   * 
   * 必須値: false
   */
  readonly isEffect: false;

  /**
   * カテゴリ: 特殊勝利条件
   * 
   * 必須値: "VictoryCondition"
   */
  readonly category: "VictoryCondition";

  /**
   * 適用条件チェック
   *
   * 手札にエクゾディア5パーツが揃っているかを判定する。
   *
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト（未使用）
   * @returns 5パーツが揃っている場合true
   *
   * @example
   * ```typescript
   * const rule = new ExodiaVictoryRule();
   * const state = createExodiaVictoryState();
   * const canApply = rule.canApply(state, {});
   * // canApply === true (5パーツ揃っている)
   * ```
   */
  canApply(state: GameState, context: RuleContext): boolean;

  /**
   * 勝利条件判定
   *
   * canApply()がtrueの場合、このメソッドが呼ばれて勝利を判定する。
   * エクゾディアの場合、5パーツが揃っていれば必ず勝利。
   *
   * @param state - 現在のゲーム状態（未使用）
   * @param context - ルール適用コンテキスト（未使用）
   * @returns 勝利条件を満たしている（常にtrue）
   *
   * @example
   * ```typescript
   * const rule = new ExodiaVictoryRule();
   * const state = createExodiaVictoryState();
   * if (rule.canApply(state, {}) && rule.checkPermission(state, {})) {
   *   // 勝利!
   * }
   * ```
   */
  checkPermission(state: GameState, context: RuleContext): boolean;
}

/**
 * ExodiaVictoryRule 実装要件
 */
export interface ExodiaVictoryRuleRequirements {
  /**
   * Field Requirements
   */
  fields: {
    isEffect: {
      type: "boolean";
      value: false;
      description: "効果外テキスト（無効化されない）";
    };
    category: {
      type: "RuleCategory";
      value: "VictoryCondition";
      description: "特殊勝利条件カテゴリ";
    };
  };

  /**
   * Method Requirements
   */
  methods: {
    canApply: {
      signature: "(state: GameState, context: RuleContext) => boolean";
      description: "手札にエクゾディア5パーツが揃っているかを判定";
      dependencies: ["hasExodiaInHand()"];
      implementation: "return hasExodiaInHand(state)";
    };
    checkPermission: {
      signature: "(state: GameState, context: RuleContext) => boolean";
      description: "勝利条件を満たしているかを確認";
      implementation: "return true";
      note: "canApply()がtrueの場合のみ呼ばれるため、常にtrueを返す";
    };
  };

  /**
   * Validation Rules
   */
  validation: {
    canApply: [
      "hasExodiaInHand(state)の結果を返すこと",
      "副作用を持たないこと（純粋関数）"
    ];
    checkPermission: [
      "常にtrueを返すこと",
      "副作用を持たないこと（純粋関数）"
    ];
  };

  /**
   * Testing Requirements
   */
  testing: {
    unit: [
      "isEffectがfalseであることを確認",
      "categoryが'VictoryCondition'であることを確認",
      "canApply()が5パーツ揃っている場合にtrueを返すことを確認",
      "canApply()が5パーツ未満の場合にfalseを返すことを確認",
      "checkPermission()が常にtrueを返すことを確認"
    ];
    integration: [
      "VictoryRule.checkVictoryConditions()がExodiaVictoryRuleを正しく使用することを確認",
      "エクゾディア勝利メッセージが正しく表示されることを確認"
    ];
  };
}

/**
 * Type Guards
 */

/**
 * ExodiaVictoryRuleの型ガード
 *
 * @param rule - チェック対象のAdditionalRule
 * @returns ExodiaVictoryRuleの場合true
 */
export function isExodiaVictoryRule(rule: AdditionalRule): rule is IExodiaVictoryRule {
  return rule.isEffect === false && rule.category === "VictoryCondition";
}

/**
 * Usage Example
 */

/**
 * ExodiaVictoryRuleの使用例
 *
 * @example
 * ```typescript
 * import { ExodiaVictoryRule } from "$lib/domain/effects/additional/ExodiaVictoryRule";
 * import type { GameState } from "$lib/domain/models/GameState";
 *
 * // VictoryRule.ts内での使用
 * export function checkVictoryConditions(state: GameState): GameResult {
 *   // 特殊勝利条件チェック
 *   const exodiaRule = new ExodiaVictoryRule();
 *   if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) {
 *     return {
 *       isGameOver: true,
 *       winner: "player",
 *       reason: "exodia",
 *       message: `エクゾディア揃った！5つのパーツが手札に揃いました。勝利です！`,
 *     };
 *   }
 *
 *   // 基本勝利条件チェック
 *   // ...
 * }
 * ```
 */
