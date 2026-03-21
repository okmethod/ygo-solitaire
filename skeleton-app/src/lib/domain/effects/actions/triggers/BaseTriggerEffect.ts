/**
 * BaseTriggerEffect - 誘発効果の抽象基底クラス
 *
 * Template Methodパターンを使用し、誘発効果の基本フローを定義する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: カード固有条件（サブクラス）
 * - ACTIVATIONS: 発動通知（共通）、カード固有の発動処理（サブクラス）
 * - RESOLUTIONS: カード固有の解決処理（サブクラス）
 *
 * 補足: イベント処理システムが事前にチェックする前提条件:
 * - トリガーイベントが発生したこと
 * - カードがフィールドに表側表示で存在すること
 * - selfOnly の場合、イベント発生源が自身であること
 *
 * @module domain/effects/actions/triggers/BaseTriggerEffect
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult, EventType } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ChainableAction, EffectId } from "$lib/domain/models/Effect";
import { Effect } from "$lib/domain/models/Effect";
import { notifyActivationStep } from "$lib/domain/dsl/steps/primitives/userInteractions";

/**
 * BaseTriggerEffect - 誘発効果アクションの抽象基底クラス
 *
 * ChainableActionインターフェースを実装し、誘発効果共通のロジックを提供する。
 *
 * @abstract
 */
export abstract class BaseTriggerEffect implements ChainableAction {
  /** カードID（数値） */
  readonly cardId: number;

  /** 効果の一意識別子 */
  readonly effectId: EffectId;

  /** 効果カテゴリ: 誘発効果 */
  readonly effectCategory = "trigger" as const;

  /** スペルスピード（誘発効果は通常1、一部のカードで2） */
  readonly spellSpeed: 1 | 2;

  /** トリガーイベント（サブクラスで定義） */
  abstract readonly triggers: readonly EventType[];

  /** トリガータイミング種別（サブクラスで定義） */
  abstract readonly triggerTiming: "when" | "if";

  /** 強制効果かどうか（サブクラスで定義） */
  abstract readonly isMandatory: boolean;

  /** 自身が発生源のイベントのみに反応するか（サブクラスで定義） */
  abstract readonly selfOnly: boolean;

  /** 自身が発生源のイベントを除外するか（サブクラスで定義） */
  abstract readonly excludeSelf: boolean;

  /**
   * コンストラクタ
   * @param cardId - カードID（数値）
   * @param effectIndex - 同一カードの誘発効果の番号
   * @param spellSpeed - スペルスピード（デフォルト: 1）
   */
  constructor(cardId: number, effectIndex: number, spellSpeed: 1 | 2 = 1) {
    this.cardId = cardId;
    this.spellSpeed = spellSpeed;
    this.effectId = Effect.Id.create("trigger", cardId, effectIndex);
  }

  /**
   * CONDITIONS: 発動条件チェック（誘発効果共通）
   *
   * Template Method パターン
   * - このメソッドは final として扱う。
   * - サブクラスで抽象メソッドを実装する。
   *
   * チェック項目:
   * 1. カード固有の発動条件
   *
   * 注: トリガーイベントの発生チェックやselfOnlyチェックは、
   * イベント処理システム（effectQueueStore）で事前に行われる。
   * タイミングを逃す処理（triggerTiming: "when"）は将来実装予定。
   *
   * @final このメソッドはオーバーライドしない
   */
  canActivate(state: GameSnapshot, sourceInstance: CardInstance): ValidationResult {
    // カード固有の発動条件チェック
    const individualResult = this.individualConditions(state, sourceInstance);
    if (!individualResult.isValid) {
      return individualResult;
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
   * ACTIVATIONS: 発動時の処理
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
  createActivationSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return [
      notifyActivationStep(sourceInstance.id), // 発動通知ステップ
      ...this.individualActivationSteps(state, sourceInstance),
    ];
  }

  /**
   * ACTIVATIONS: 発動処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualActivationSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTIONS: 効果解決時の処理
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
  createResolutionSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return [...this.individualResolutionSteps(state, sourceInstance)];
  }

  /**
   * RESOLUTIONS: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];
}

/**
 * ChainableActionがBaseTriggerEffectかどうかを判定する型ガード関数
 *
 * @param action - ChainableAction
 * @returns actionがBaseTriggerEffectの場合true
 */
export function isTriggerEffect(action: ChainableAction): action is BaseTriggerEffect {
  return action.effectCategory === "trigger";
}
