/**
 * ChainableAction - チェーンブロックを作る処理のモデル
 *
 * @module domain/models/ChainableAction
 * @see {@link docs/domain/effect-model.md}
 */

import type { GameState } from "./GameState";
import type { AtomicStep } from "./AtomicStep";

/**
 * チェーンブロックを作る処理
 *
 * カードの発動、効果の発動を表現する。
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
   *
   * 注: チェーンシステムはスコープ外だが、将来の拡張のため型定義
   */
  readonly spellSpeed: 1 | 2 | 3;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * 発動を宣言できるかどうかを判定する。
   * - フェーズチェック（Main Phase Only等）
   * - コスト支払い可否（LPコスト、手札コスト等）
   * - 対象の存在チェック
   * - 1ターンに1度制限（activatedIgnitionEffectsThisTurnで判定）
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  canActivate(state: GameState): boolean;

  /**
   * ACTIVATION: 発動時の処理（即座に実行）
   *
   * 発動を宣言した瞬間に実行される処理。無効化されても取り消されない。
   * - コスト支払い（LPコスト、手札捨て等）
   * - 対象指定（対象を取る効果の場合）
   * - カード配置（カードの発動の場合）
   *
   * 注: 通常魔法は即座に実行する処理がないため、空配列を返す
   *
   * @param state - 現在のゲーム状態
   * @returns 発動時の処理ステップ配列（空配列も可）
   */
  createActivationSteps(state: GameState): AtomicStep[];

  /**
   * RESOLUTION: 効果解決時の処理（チェーン解決時に実行）
   *
   * チェーン解決時に適用されるメインの処理（狭義の「効果」）。
   * 無効化される可能性がある。
   * - カードドロー
   * - カード破壊
   * - ステータス変更
   * - 特殊召喚
   * - グレーブ送り（通常魔法の場合は最後に自動追加）
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決時の処理ステップ配列
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];
}
