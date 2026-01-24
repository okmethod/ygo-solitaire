/**
 * FieldSpellAction - フィールド魔法カード発動の抽象基底クラス
 *
 * BaseSpellAction を拡張し、フィールド魔法に共通するプロパティとメソッドを提供する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: メインフェイズのみ
 * - ACTIVATION: 特になし（サブクラスで実装）
 * - RESOLUTION: 特になし（サブクラスで実装）
 *
 * @module domain/effects/base/spell/FieldSpellAction
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { BaseSpellAction } from "$lib/domain/effects/base/spell/BaseSpellAction";
import { isMainPhase } from "$lib/domain/models/Phase";

/**
 * FieldSpellAction - フィールド魔法カードの抽象基底クラス
 *
 * @abstract
 */
export abstract class FieldSpellAction extends BaseSpellAction {
  /** スペルスピード1（フィールド魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック（フィールド魔法共通）
   *
   * チェック項目:
   * 1. メインフェイズであること
   *
   * @final このメソッドはオーバーライドしない
   */
  subTypeConditions(state: GameState): boolean {
    // 1. メインフェイズであること
    if (!isMainPhase(state.phase)) {
      return false;
    }

    return true;
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualConditions(state: GameState): boolean;

  /**
   * ACTIVATION: 発動時の処理
   *
   * フィールド魔法は発動ステップを持ちません（配置はActivateSpellCommandが行います）。
   * 基底クラスをオーバーライドして空配列を返します。
   *
   * @param _state - 現在のゲーム状態
   * @returns 空配列（発動時の処理なし）
   */
  createActivationSteps(_state: GameState): AtomicStep[] {
    // フィールド魔法は発動ステップを持ちません（配置はActivateSpellCommandが行います）
    return [];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * サブクラスでこのメソッドを実装し、カード固有の効果解決ステップを定義します。
   * フィールド魔法は通常、空の解決ステップを持ちます（継続効果のみ）。
   * 発動によりカードがフィールドに配置され、墓地送りステップは不要です。
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   * @abstract
   */
  abstract createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];
}
