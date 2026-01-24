/**
 * ContinuousSpellAction - 永続魔法カード発動の抽象基底クラス
 *
 * BaseSpellAction を拡張し、永続魔法に共通するプロパティとメソッドを提供する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: メインフェイズのみ
 * - ACTIVATION: 特になし（サブクラスで実装）
 * - RESOLUTION: 特になし（サブクラスで実装）
 *
 * @module domain/effects/base/spell/ContinuousSpellAction
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { BaseSpellAction } from "$lib/domain/effects/base/spell/BaseSpellAction";
import { isMainPhase } from "$lib/domain/models/Phase";

/**
 * ContinuousSpellAction - 永続魔法カードの抽象基底クラス
 *
 * @abstract
 */
export abstract class ContinuousSpellAction extends BaseSpellAction {
  /** スペルスピード1（永続魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック（永続魔法共通）
   *
   * チェック項目:
   * 1. メインフェイズであること
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypeConditions(state: GameState): boolean {
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
   * ACTIVATION: 発動前処理（永続魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreActivationSteps(_state: GameState): AtomicStep[] {
    return []; // 永続魔法は発動前処理なし
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualActivationSteps(_state: GameState): AtomicStep[];

  /**
   * ACTIVATION: 発動後処理（永続魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostActivationSteps(_state: GameState): AtomicStep[] {
    return []; // 永続魔法は発動後処理なし
  }

  /**
   * RESOLUTION: 効果解決前処理（永続魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return []; // 永続魔法は効果解決前処理なし
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];

  /**
   * RESOLUTION: 効果解決後処理（永続魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return []; // 永続魔法は効果解決後処理なし（フィールドに残る）
  }
}
