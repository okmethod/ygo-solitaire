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
 * @module domain/effects/actions/spells/ContinuousSpellAction
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { BaseSpellAction } from "$lib/domain/effects/actions/activations/BaseSpellAction";

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
  protected subTypeConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // 1. メインフェイズであること
    if (!GameState.Phase.isMain(state.phase)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
    }

    return GameProcessing.Validation.success();
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualConditions(state: GameSnapshot, sourceInstance: CardInstance): ValidationResult;

  /**
   * ACTIVATION: 発動前処理（永続魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 永続魔法は発動前処理なし
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualActivationSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];

  /**
   * ACTIVATION: 発動後処理（永続魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 永続魔法は発動後処理なし
  }

  /**
   * RESOLUTION: 効果解決前処理（永続魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 永続魔法は効果解決前処理なし
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTION: 効果解決後処理（永続魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 永続魔法は効果解決後処理なし（フィールドに残る）
  }
}
