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
 * @module domain/effects/base/spell/NormalSpellAction
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { BaseSpellAction } from "$lib/domain/effects/base/spell/BaseSpellAction";
import { isMainPhase } from "$lib/domain/models/Phase";
import { getCardData, getCardNameWithBrackets } from "$lib/domain/registries/CardDataRegistry";

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
   * @final このメソッドはオーバーライドしない
   */
  subTypeConditions(state: GameState): boolean {
    // 1. メインフェイズであること
    if (!isMainPhase(state.phase)) {
      return false;
    }

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
   * 「1ターンに1度」制限を持つカードの発動ステップを作成します
   *
   * このメソッドは、カード名を指定した「1ターンに1度」制限を持つカードで使用します。
   * activatedOncePerTurnCards に cardId を記録するステップを返します。
   *
   * @param _state - 現在のゲーム状態（未使用だが、インターフェース統一のため）
   * @returns 発動ステップ配列
   * @protected
   * @example
   * ```typescript
   * // Card of Demise / Pot of Duality 等の「1ターンに1度」制限カード
   * createActivationSteps(_state: GameState): AtomicStep[] {
   *   return this.createOncePerTurnActivationSteps();
   * }
   * ```
   */
  protected createOncePerTurnActivationSteps(): AtomicStep[] {
    const cardData = getCardData(this.cardId);

    return [
      {
        id: `${this.cardId}-activation-once-per-turn`,
        summary: "カード発動",
        description: `${getCardNameWithBrackets(this.cardId)}を発動します`,
        notificationLevel: "info",
        action: (currentState: GameState): GameStateUpdateResult => {
          // activatedOncePerTurnCards に記録
          const newActivatedCards = new Set(currentState.activatedOncePerTurnCards);
          newActivatedCards.add(this.cardId);

          const updatedState: GameState = {
            ...currentState,
            activatedOncePerTurnCards: newActivatedCards,
          };

          return {
            success: true,
            updatedState,
            message: `${cardData.jaName} activated (once per turn)`,
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * サブクラスでこのメソッドを実装し、カード固有の効果解決ステップを定義する。
   * TODO: 通常魔法の墓地送りは現状コマンド側。どっちでやるべき？？
   *
   * @abstract
   */
  abstract createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];
}
