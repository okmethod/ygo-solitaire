/**
 * ChainableAction - チェーンブロックを作る処理のモデル
 *
 * @module domain/models/ChainableAction
 * @see {@link docs/domain/effect-model.md}
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { EffectCategory } from "$lib/domain/models/EffectCategory";

/**
 * チェーンブロックを作る処理
 *
 * カードの発動・効果の発動と、発動条件、効果処理を表現。
 * 公式ルールの CONDITIONS/ACTIVATION/RESOLUTION に対応。
 */
export interface ChainableAction {
  /**
   * カードの発動 or 効果の発動
   * - true: カードの発動（手札→フィールドへの配置を伴う）
   * - false: 効果の発動（既にフィールドに存在するカードの効果）
   */
  readonly isCardActivation: boolean;

  /**
   * スペルスピード
   * - 1: Normal Spell/Effect (通常魔法、起動効果)
   * - 2: Quick-Play Spell/Effect (速攻魔法、誘発効果、クイックエフェクト)
   * - 3: Counter Trap (カウンター罠)
   */
  readonly spellSpeed: 1 | 2 | 3;

  /**
   * 効果カテゴリ
   * - activation: カードの発動時効果
   * - ignition: 起動効果
   */
  readonly effectCategory: EffectCategory;

  /**
   * 効果の一意識別子
   * 1ターンに1度制限等で使用。形式: "{カード名}-{効果種別}"
   * 例: "chicken-game-activation", "chicken-game-ignition"
   */
  readonly effectId: string;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * 発動できるかどうかを判定する。
   * - フェイズチェック（メインフェイズのみ等）
   * - コスト支払い可否（LPコスト、手札コスト等）
   * - 1ターンに1度制限（activatedIgnitionEffectsThisTurnで判定）
   */
  canActivate(state: GameState, sourceInstance: CardInstance): ValidationResult;

  /**
   * ACTIVATION: 発動時の処理
   *
   * 発動後即座に実行される処理。無効化されても取り消されない。
   * - コスト支払い（LPコスト、手札捨て等）
   * - 対象指定（対象を取る効果の場合）
   * - カード配置（カードの発動の場合）
   */
  createActivationSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * チェーン解決時に実行される処理。無効化される可能性がある。
   * （狭義の「効果」）
   * - ドロー
   * - カード破壊
   * - ステータス変更
   * - 特殊召喚
   */
  createResolutionSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];
}
