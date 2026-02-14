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
 * @module domain/effects/actions/spells/QuickPlaySpellAction
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import { BaseSpellAction } from "$lib/domain/effects/actions/activations/BaseSpellAction";
import { isFaceDown } from "$lib/domain/models/Card";
import { sendToGraveyardStep } from "$lib/domain/effects/steps/discards";
import {
  ValidationErrorCode,
  successValidationResult,
  failureValidationResult,
} from "$lib/domain/models/ValidationResult";

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
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypeConditions(_state: GameState, sourceInstance: CardInstance): ValidationResult {
    // 1. セットしたターンではないこと
    if (isFaceDown(sourceInstance) && sourceInstance.stateOnField?.placedThisTurn) {
      return failureValidationResult(ValidationErrorCode.QUICK_PLAY_RESTRICTION);
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
   * ACTIVATION: 発動前処理（速攻魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 速攻魔法は発動前処理なし
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   */
  protected abstract individualActivationSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[];

  /**
   * ACTIVATION: 発動後処理（速攻魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 速攻魔法は発動後処理なし
  }

  /**
   * RESOLUTION: 効果解決前処理（速攻魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 速攻魔法は効果解決前処理なし
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTION: 効果解決後処理（速攻魔法共通）
   *
   * 速攻魔法は効果解決後に墓地へ送られる。
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostResolutionSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    return [sendToGraveyardStep(sourceInstance.instanceId, sourceInstance.jaName)];
  }
}
