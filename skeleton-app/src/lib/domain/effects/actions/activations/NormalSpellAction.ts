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
 * @module domain/effects/actions/spells/NormalSpellAction
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { CardInstance } from "$lib/domain/models/CardOld";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { BaseSpellAction } from "$lib/domain/effects/actions/activations/BaseSpellAction";
import { isMainPhase } from "$lib/domain/models/Phase";
import { sendToGraveyardStep } from "$lib/domain/effects/steps/discards";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

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
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypeConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
    // 1. メインフェイズであること
    if (!isMainPhase(state.phase)) {
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
  protected abstract individualConditions(state: GameState, sourceInstance: CardInstance): ValidationResult;

  /**
   * ACTIVATION: 発動前処理（通常魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 通常魔法は発動前処理なし
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   */
  protected abstract individualActivationSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[];

  /**
   * ACTIVATION: 発動後処理（通常魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostActivationSteps(_state: GameState): AtomicStep[] {
    return []; // 通常魔法は発動後処理なし
  }

  /**
   * RESOLUTION: 効果解決前処理（通常魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 通常魔法は効果解決前処理なし
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTION: 効果解決後処理（通常魔法共通）
   *
   * 通常魔法は効果解決後に墓地へ送られる。
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostResolutionSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    return [sendToGraveyardStep(sourceInstance.instanceId, sourceInstance.jaName)];
  }
}
