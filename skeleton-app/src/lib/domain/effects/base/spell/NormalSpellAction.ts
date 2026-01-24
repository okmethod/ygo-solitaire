/**
 * NormalSpellAction - 通常魔法カード発動の抽象基底クラス
 *
 * BaseSpellAction を拡張し、通常魔法に共通するプロパティとメソッドを提供する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: メインフェイズのみ
 * - ACTIVATION: 特になし（サブクラスで実装）
 * - RESOLUTION: 効果解決後に墓地に送られる
 *
 * @module domain/effects/base/spell/NormalSpellAction
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { BaseSpellAction } from "$lib/domain/effects/base/spell/BaseSpellAction";
import { isMainPhase } from "$lib/domain/models/Phase";

/**
 * NormalSpellAction - 通常魔法カードの抽象基底クラス
 *
 * @abstract
 */
export abstract class NormalSpellAction extends BaseSpellAction {
  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック（通常魔法共通）
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
   * RESOLUTION: 効果解決時の処理
   *
   * サブクラスでこのメソッドを実装し、カード固有の効果解決ステップを定義する。
   * TODO: 通常魔法の墓地送りは現状コマンド側。どっちでやるべき？？
   *
   * @abstract
   */
  abstract createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];
}
