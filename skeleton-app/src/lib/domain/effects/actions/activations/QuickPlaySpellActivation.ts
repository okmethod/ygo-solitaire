/**
 * QuickPlaySpellActivation - 速攻魔法カード発動の抽象基底クラス
 *
 * BaseSpellActivation を拡張し、速攻魔法に共通するプロパティとメソッドを提供する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: セットしたターンではない
 * - ACTIVATION: 特になし（サブクラスで実装）
 * - RESOLUTION: 効果解決後に墓地に送られる
 *
 * @module domain/effects/actions/spells/QuickPlaySpellActivation
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { BaseSpellActivation } from "$lib/domain/effects/actions/activations/BaseSpellActivation";
import { sendToGraveyardStep } from "$lib/domain/effects/steps/discards";

/**
 * QuickPlaySpellActivation - 速攻魔法カードの抽象基底クラス
 *
 * @abstract
 */
export abstract class QuickPlaySpellActivation extends BaseSpellActivation {
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
  protected subTypeConditions(_state: GameSnapshot, sourceInstance: CardInstance): ValidationResult {
    // 1. セットしたターンではないこと
    if (Card.Instance.isFaceDown(sourceInstance) && sourceInstance.stateOnField?.placedThisTurn) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.QUICK_PLAY_RESTRICTION);
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
   * ACTIVATION: 発動前処理（速攻魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 速攻魔法は発動前処理なし
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   */
  protected abstract individualActivationSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];

  /**
   * ACTIVATION: 発動後処理（速攻魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 速攻魔法は発動後処理なし
  }

  /**
   * RESOLUTION: 効果解決前処理（速攻魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return []; // 速攻魔法は効果解決前処理なし
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTION: 効果解決後処理（速攻魔法共通）
   *
   * 速攻魔法は効果解決後に墓地へ送られる。
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostResolutionSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return [sendToGraveyardStep(sourceInstance.instanceId, sourceInstance.jaName)];
  }

  /**
   * 速攻魔法発動効果の空実装クラスを生成する
   *
   * 発動時に固有の処理を持たない速攻魔法用。
   */
  static createNoOp(cardId: number): QuickPlaySpellActivation {
    return new NoOpQuickPlaySpellActivation(cardId);
  }
}

/** 速攻魔法発動効果の空実装クラス */
class NoOpQuickPlaySpellActivation extends QuickPlaySpellActivation {
  constructor(cardId: number) {
    super(cardId);
  }

  protected individualConditions(): ValidationResult {
    return GameProcessing.Validation.success();
  }

  protected individualActivationSteps(): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(): AtomicStep[] {
    return [];
  }
}
