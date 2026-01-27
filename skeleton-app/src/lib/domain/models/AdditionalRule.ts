/**
 * AdditionalRule - 追加ルールのモデル
 *
 * @module domain/models/AdditionalRule
 * @see {@link docs/domain/effect-model.md}
 */

import type { GameState } from "./GameState";
import type { RuleContext } from "./RuleContext";

/** 追加ルールのカテゴリ */
export type RuleCategory =
  // データ書き換え系
  | "NameOverride" // カード名変更（例: ハーピィ・レディ3姉妹）
  | "StatusModifier" // 攻撃力/守備力変更（例: 団結の力）
  // 判定追加・制限追加系
  | "SummonCondition" // 特殊召喚条件（例: 青眼の究極竜）
  | "SummonPermission" // 召喚回数制限（例: マジェスペクター）
  | "ActionPermission" // 行動制限（例: 攻撃不可、効果発動不可、ダメージ無効化）
  | "VictoryCondition" // 特殊勝利判定（例: エクゾディア）
  // 処理置換・処理フック系
  | "ActionReplacement" // 破壊耐性、身代わり効果（例: スターダスト・ドラゴン）
  | "SelfDestruction"; // 維持コスト、自壊（例: ペンデュラム地帯）

/**
 * 追加ルール
 *
 * 永続効果、ルール効果、効果外テキストを実装するための統一インターフェース。
 * カテゴリに応じて適切なメソッドを実装する。
 */
export interface AdditionalRule {
  /**
   * ルール上「効果」にあたるか
   *
   * - true: 永続効果、分類されない効果（無効化される）
   * - false: 効果外テキスト（無効化されない）
   *
   * 注: 本specではスコープ外だが、将来の無効化処理実装のため型定義
   */
  readonly isEffect: boolean;

  /**
   * ルールのカテゴリ
   *
   * どの処理に介入するかを定義する。
   * - データ書き換え系: apply()メソッド使用
   * - 判定追加・制限追加系: checkPermission()メソッド使用
   * - 処理置換・処理フック系: replace()メソッド使用
   */
  readonly category: RuleCategory;

  /**
   * 適用条件チェック
   *
   * このルールが現在適用可能かを判定する。
   * - カードがフィールドに存在するか
   * - 表側表示か
   * - 特定の条件を満たしているか（LP差分等）
   *
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト
   * @returns 適用可能ならtrue
   */
  canApply(state: GameState, context: RuleContext): boolean;

  /**
   * データ書き換え系（NameOverride, StatusModifier）
   *
   * カード名、攻撃力/守備力などのデータを直接書き換える。
   *
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト
   * @returns 新しいゲーム状態
   */
  apply?(state: GameState, context: RuleContext): GameState;

  /**
   * 判定追加・制限系（SummonCondition, Permission, VictoryCondition）
   *
   * 行動の可否を判定する。
   * - 攻撃できるか
   * - 効果を発動できるか
   * - ダメージを受けるか
   * - 勝利条件を満たしたか
   *
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト
   * @returns 許可ならtrue、禁止ならfalse
   */
  checkPermission?(state: GameState, context: RuleContext): boolean;

  /**
   * 処理置換・フック系（ActionReplacement, SelfDestruction）
   *
   * 処理を別の処理に置き換える。
   * - 破壊される → 破壊されない
   * - 墓地に行く → デッキに戻る
   * - 維持コスト未払い → 自壊
   *
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト
   * @returns 置換後のゲーム状態
   */
  replace?(state: GameState, context: RuleContext): GameState;
}
