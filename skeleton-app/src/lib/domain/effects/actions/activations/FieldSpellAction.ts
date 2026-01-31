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
 * @module domain/effects/actions/spells/FieldSpellAction
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import { BaseSpellAction } from "$lib/domain/effects/actions/activations/BaseSpellAction";
import { isMainPhase } from "$lib/domain/models/Phase";
import {
  ValidationErrorCode,
  successValidationResult,
  failureValidationResult,
} from "$lib/domain/models/ValidationResult";

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
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypeConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
    // 1. メインフェイズであること
    if (!isMainPhase(state.phase)) {
      return failureValidationResult(ValidationErrorCode.NOT_MAIN_PHASE);
    }

    return successValidationResult();
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualConditions(state: GameState, sourceInstance: CardInstance): ValidationResult;

  /**
   * ACTIVATION: 発動前処理（フィールド魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // フィールド魔法は発動前処理なし
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualActivationSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];

  /**
   * ACTIVATION: 発動後処理（フィールド魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // フィールド魔法は発動後処理なし
  }

  /**
   * RESOLUTION: 効果解決前処理（フィールド魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // フィールド魔法は効果解決前処理なし
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTION: 効果解決後処理（フィールド魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // フィールド魔法は効果解決後処理なし（フィールドに残る）
  }
}
