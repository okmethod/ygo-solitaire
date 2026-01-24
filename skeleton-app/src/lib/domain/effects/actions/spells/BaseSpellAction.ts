/**
 * BaseSpellAction - 魔法カード発動の抽象基底クラス
 *
 * Template Methodパターンを使用し、魔法カード発動の基本フローを定義する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: 特になし（コマンド側でチェック済み、サブクラスで実装）
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 特になし（サブクラスで実装）
 *
 * 補足: ActivateSpellCommandが事前にチェックする前提条件:
 * - ゲーム終了状態でないこと
 * - カードが存在し、魔法カードであること
 * - 魔法・罠ゾーンに空きがあること（フィールド魔法除く）
 *
 * @module domain/effects/actions/spells/BaseSpellAction
 */

import type { ChainableAction } from "$lib/domain/models/ChainableAction";
import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { notifyActivationStep } from "$lib/domain/effects/steps/userInteractions";

/**
 * BaseSpellAction - 魔法カードアクションの抽象基底クラス
 *
 * ChainableActionインターフェースを実装し、魔法カード共通のロジックを提供する。
 *
 * @abstract
 */
export abstract class BaseSpellAction implements ChainableAction {
  /** カードID（数値） */
  protected readonly cardId: number;

  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード（サブクラスで定義） */
  abstract readonly spellSpeed: 1 | 2;

  /**
   * コンストラクタ
   * @param cardId - カードID（数値）
   */
  constructor(cardId: number) {
    this.cardId = cardId;
  }

  /**
   * CONDITIONS: 発動条件チェック（魔法カード共通）
   *
   * Template Method パターン
   * - このメソッドは final として扱う。
   * - サブクラスで抽象メソッドを実装する。
   *
   * チェック項目:
   * 1. 魔法カード共通の発動条件
   * 2. 魔法カードサブタイプ共通の発動条件
   * 3. カード固有の発動条件
   *
   * @final このメソッドはオーバーライドしない
   */
  canActivate(state: GameState): boolean {
    // 1. 魔法カード共通の発動条件チェック
    // 特になし

    // 2. 魔法カードサブタイプ共通の発動条件チェック
    if (!this.subTypeConditions(state)) {
      return false;
    }

    // 3. カード固有の発動条件チェック
    if (!this.individualConditions(state)) {
      return false;
    }

    return true;
  }

  /**
   * CONDITIONS: 発動条件チェック（魔法カードサブタイプ共通）
   *
   * @protected
   * @abstract
   */
  protected abstract subTypeConditions(state: GameState): boolean;

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
   * Template Method パターン
   * - このメソッドは final として扱う。
   * - サブクラスで抽象メソッドを実装する。
   *
   * 実行順序:
   * 1. notifyActivationStep: 発動通知（共通）
   * 2. subTypePreActivationSteps: 魔法カードサブタイプ共通の発動処理
   * 3. individualActivationSteps: カード固有の発動処理
   * 4. subTypePostActivationSteps: 魔法カードサブタイプ共通の発動後処理
   *
   * @final このメソッドはオーバーライドしない
   */
  createActivationSteps(state: GameState): AtomicStep[] {
    return [
      notifyActivationStep(this.cardId), // 発動通知ステップ
      ...this.subTypePreActivationSteps(state),
      ...this.individualActivationSteps(state),
      ...this.subTypePostActivationSteps(state),
    ];
  }

  /**
   * ACTIVATION: 発動前処理（魔法カードサブタイプ共通）
   *
   * @protected
   */
  protected abstract subTypePreActivationSteps(state: GameState): AtomicStep[];

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   */
  protected abstract individualActivationSteps(state: GameState): AtomicStep[];

  /**
   * ACTIVATION: 発動後処理（魔法カードサブタイプ共通）
   *
   * @protected
   */
  protected abstract subTypePostActivationSteps(state: GameState): AtomicStep[];

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * Template Method パターン
   * - このメソッドは final として扱う。
   * - サブクラスで抽象メソッドを実装する。
   *
   * 実行順序:
   * 1. subTypePreResolutionSteps: 魔法カードサブタイプ共通の解決前処理
   * 2. individualResolutionSteps: カード固有の解決処理
   * 3. subTypePostResolutionSteps: 魔法カードサブタイプ共通の解決後処理
   *
   * @final このメソッドはオーバーライドしない
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      ...this.subTypePreResolutionSteps(state, activatedCardInstanceId),
      ...this.individualResolutionSteps(state, activatedCardInstanceId),
      ...this.subTypePostResolutionSteps(state, activatedCardInstanceId),
    ];
  }

  /**
   * RESOLUTION: 効果解決前処理（魔法カードサブタイプ共通）
   *
   * @protected
   * @abstract
   */
  protected abstract subTypePreResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];

  /**
   * RESOLUTION: 効果解決後処理（魔法カードサブタイプ共通）
   *
   * @protected
   * @abstract
   */
  protected abstract subTypePostResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];
}
