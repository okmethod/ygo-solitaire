/**
 * BaseIgnitionEffect - 起動効果の抽象基底クラス
 *
 * Template Methodパターンを使用し、起動効果の基本フローを定義する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: メインフェイズであること（共通）、カード固有条件（サブクラス）
 * - ACTIVATION: 発動通知（共通）、カード固有の発動処理（サブクラス）
 * - RESOLUTION: カード固有の解決処理（サブクラス）
 *
 * 補足: ActivateIgnitionEffectCommandが事前にチェックする前提条件:
 * - ゲーム終了状態でないこと
 * - カードがフィールドに表側表示で存在すること
 *
 * @module domain/effects/actions/BaseIgnitionEffect
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ChainableAction } from "$lib/domain/models/ChainableAction";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { EffectCategory } from "$lib/domain/models/EffectCategory";
import {
  successValidationResult,
  failureValidationResult,
  ValidationErrorCode,
} from "$lib/domain/models/ValidationResult";
import { isMainPhase } from "$lib/domain/models/Phase";
import { notifyActivationStep } from "$lib/domain/effects/steps/userInteractions";

/**
 * BaseIgnitionEffect - 起動効果アクションの抽象基底クラス
 *
 * ChainableActionインターフェースを実装し、起動効果共通のロジックを提供する。
 *
 * @abstract
 */
export abstract class BaseIgnitionEffect implements ChainableAction {
  /** カードID（数値） */
  readonly cardId: number;

  /** 効果の一意識別子 */
  readonly effectId: string;

  /** 効果の発動（カードの発動ではない） */
  readonly isCardActivation = false;

  /** 効果カテゴリ: 起動効果 */
  readonly effectCategory: EffectCategory = "ignition" as const;

  /** スペルスピード1（起動効果は常にスペルスピード1） */
  readonly spellSpeed = 1 as const;

  /**
   * コンストラクタ
   * @param cardId - カードID（数値）
   * @param effectIndex - 同一カードの起動効果の番号
   */
  constructor(cardId: number, effectIndex: number) {
    this.cardId = cardId;
    this.effectId = `ignition-${cardId}-${effectIndex}`;
  }

  /**
   * CONDITIONS: 発動条件チェック（起動効果共通）
   *
   * Template Method パターン
   * - このメソッドは final として扱う。
   * - サブクラスで抽象メソッドを実装する。
   *
   * チェック項目:
   * 1. 起動効果共通の発動条件（メインフェイズであること）
   * 2. カード固有の発動条件
   *
   * @final このメソッドはオーバーライドしない
   */
  canActivate(state: GameState, sourceInstance: CardInstance): ValidationResult {
    // 1. 起動効果共通の発動条件チェック（メインフェイズであること）
    if (!isMainPhase(state.phase)) {
      return failureValidationResult(ValidationErrorCode.NOT_MAIN_PHASE);
    }

    // 2. カード固有の発動条件チェック
    const individualResult = this.individualConditions(state, sourceInstance);
    if (!individualResult.isValid) {
      return individualResult;
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
   * ACTIVATION: 発動時の処理
   *
   * Template Method パターン
   * - このメソッドは final として扱う。
   * - サブクラスで抽象メソッドを実装する。
   *
   * 実行順序:
   * 1. notifyActivationStep: 発動通知（共通）
   * 2. individualActivationSteps: カード固有の発動処理
   *
   * @final このメソッドはオーバーライドしない
   */
  createActivationSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    return [
      notifyActivationStep(sourceInstance.id), // 発動通知ステップ
      ...this.individualActivationSteps(state, sourceInstance),
    ];
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualActivationSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * Template Method パターン
   * - このメソッドは final として扱う。
   * - サブクラスで抽象メソッドを実装する。
   *
   * 実行順序:
   * 1. individualResolutionSteps: カード固有の解決処理
   *
   * @final このメソッドはオーバーライドしない
   */
  createResolutionSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    return [...this.individualResolutionSteps(state, sourceInstance)];
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];
}
