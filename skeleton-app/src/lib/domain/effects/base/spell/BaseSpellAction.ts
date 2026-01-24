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
 * @module domain/effects/base/spell/BaseSpellAction
 */

import type { ChainableAction } from "$lib/domain/models/ChainableAction";
import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { getCardData, getCardNameWithBrackets } from "$lib/domain/registries/CardDataRegistry";

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
   * - サブクラスは subTypeConditions() と individualConditions() を実装する。
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
   * TODO: CONDITIONS と同じく Template Method パターンにしたい
   *
   * 魔法カードのデフォルト発動ステップ（通知のみ）。
   * サブクラスは発動コストが必要なカードでこれをオーバーライドできる。
   */
  createActivationSteps(_state: GameState): AtomicStep[] {
    const cardData = getCardData(this.cardId);
    return [
      {
        id: `${this.cardId}-activation`,
        summary: "カード発動",
        description: `${getCardNameWithBrackets(this.cardId)}を発動します`,
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // 状態変更なし、通知のみ
          return {
            success: true,
            updatedState: currentState,
            message: `${cardData.jaName} activated`,
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * TODO: CONDITIONS と同じく Template Method パターンにしたい
   *
   * サブクラスでこのメソッドを実装し、カード固有の効果解決ステップを定義する。
   *
   * @abstract
   */
  abstract createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];
}
