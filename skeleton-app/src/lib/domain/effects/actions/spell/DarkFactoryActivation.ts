/**
 * DarkFactoryActivation - 《闇の量産工場》(Dark Factory of Mass Production)
 *
 * Card ID: 90928333 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、墓地に通常モンスターが2体以上
 * - ACTIVATION: 発動通知のみ
 * - RESOLUTION: 墓地から通常モンスター2体を選択し手札に加える
 *
 * @module domain/effects/actions/spell/DarkFactoryActivation
 */

import type { ChainableAction } from "$lib/domain/models/ChainableAction";
import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { salvageFromGraveyardStep } from "$lib/domain/effects/steps/searches";

/**
 * DarkFactoryActivation
 *
 * Implements ChainableAction for Dark Factory of Mass Production implementation.
 */
export class DarkFactoryActivation implements ChainableAction {
  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase 1
   * - Graveyard has at least 2 Normal Monsters
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  canActivate(state: GameState): boolean {
    // Game must not be over
    if (state.result.isGameOver) {
      return false;
    }

    // Must be Main Phase 1
    if (state.phase !== "Main1") {
      return false;
    }

    // Graveyard must have at least 2 Normal Monsters
    const normalMonsters = state.zones.graveyard.filter(
      (card) => card.type === "monster" && card.frameType === "normal",
    );
    if (normalMonsters.length < 2) {
      return false;
    }

    return true;
  }

  /**
   * ACTIVATION: 発動時の処理
   *
   * 通常魔法はコストなし、対象なしのため、発動通知のみ。
   *
   * @param state - 現在のゲーム状態
   * @returns 発動通知ステップ
   */
  createActivationSteps(_state: GameState): AtomicStep[] {
    return [
      {
        id: "dark-factory-activation",
        summary: "カード発動",
        description: "闇の量産工場を発動します",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            updatedState: currentState,
            message: "Dark Factory activated",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. 墓地から通常モンスター2体を選択
   * 2. 選択したモンスターを手札に加える
   * 3. このカードを墓地に送る
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: Select 2 Normal Monsters from graveyard
      salvageFromGraveyardStep({
        id: `dark-factory-search-${activatedCardInstanceId}`,
        summary: "通常モンスター2枚をサルベージ",
        description: "墓地から通常モンスター2体を選択し、手札に加えます",
        filter: (card) => card.type === "monster" && card.frameType === "normal",
        minCards: 2,
        maxCards: 2,
        cancelable: false,
      }),
    ];
  }
}
