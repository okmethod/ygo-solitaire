/**
 * QuickPlaySpellAction - 速攻魔法カード発動の抽象基底クラス
 *
 * BaseSpellAction を拡張し、速攻魔法に共通するプロパティとメソッドを提供する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: セットしたターンではない
 * - ACTIVATION: 特になし（サブクラスで実装）
 * - RESOLUTION: 効果解決後に墓地に送られる
 *
 * @module domain/effects/base/spell/QuickPlaySpellAction
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { BaseSpellAction } from "$lib/domain/effects/base/spell/BaseSpellAction";

/**
 * QuickPlaySpellAction - 速攻魔法カードの抽象基底クラス
 *
 * @abstract
 */
export abstract class QuickPlaySpellAction extends BaseSpellAction {
  /** スペルスピード2（速攻魔法） */
  readonly spellSpeed = 2 as const;

  /**
   * CONDITIONS: 発動条件チェック（速攻魔法共通）
   *
   * チェック項目:
   * 1. セットしたターンではないこと
   *
   * @final このメソッドはオーバーライドしない
   */
  subTypeConditions(_state: GameState): boolean {
    // 1. セットしたターンではないこと
    // TODO: 要検討。ここではインスタンスに紐づくチェックができないので、コマンドに任せる？？

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
   * サブクラスでこのメソッドを実装し、カード固有の効果解決ステップを定義します。
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   * @abstract
   */
  abstract createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];
}
