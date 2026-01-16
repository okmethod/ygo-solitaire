/**
 * DarkFactoryActivation - 《闇の量産工場》(Dark Factory of Mass Production)
 *
 * Card ID: 90928333 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、墓地に通常モンスターが2体以上
 * - ACTIVATION: 発動通知のみ
 * - RESOLUTION: 墓地から通常モンスター2体を選択、手札に加える、墓地へ送る
 *
 * @module domain/effects/actions/spell/DarkFactoryActivation
 */

import type { ChainableAction } from "../../../models/ChainableAction";
import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { moveCard, sendToGraveyard } from "../../../models/Zone";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createActivationSteps(state: GameState): EffectResolutionStep[] {
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
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    // Filter graveyard for Normal Monsters only
    const normalMonsters = state.zones.graveyard.filter(
      (card) => card.type === "monster" && card.frameType === "normal",
    );

    return [
      // Step 1: Select 2 Normal Monsters from graveyard
      {
        id: "dark-factory-select",
        summary: "モンスターを選択",
        description: "墓地から通常モンスター2体を選択してください",
        notificationLevel: "interactive",
        // Card selection configuration (Domain Layer)
        cardSelectionConfig: {
          availableCards: normalMonsters,
          minCards: 2,
          maxCards: 2,
          summary: "モンスターを選択",
          description: "墓地から通常モンスター2体を選択してください",
          cancelable: false, // Cannot cancel during effect resolution
        },
        action: (currentState: GameState, selectedInstanceIds?: string[]) => {
          // Validate selectedInstanceIds is provided
          if (!selectedInstanceIds || selectedInstanceIds.length !== 2) {
            return {
              success: false,
              updatedState: currentState,
              error: "Must select exactly 2 Normal Monsters from graveyard",
            };
          }

          // Move selected monsters from graveyard to hand
          let updatedZones = currentState.zones;
          for (const instanceId of selectedInstanceIds) {
            updatedZones = moveCard(updatedZones, instanceId, "graveyard", "hand");
          }

          const updatedState: GameState = {
            ...currentState,
            zones: updatedZones,
          };

          return {
            success: true,
            updatedState,
            message: "Added 2 Normal Monsters from graveyard to hand",
          };
        },
      },

      // Step 2: Send spell card to graveyard
      {
        id: "dark-factory-graveyard",
        summary: "墓地へ送る",
        description: "闇の量産工場を墓地に送ります",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // Send activated spell card to graveyard
          const newZones = sendToGraveyard(currentState.zones, activatedCardInstanceId);

          const updatedState: GameState = {
            ...currentState,
            zones: newZones,
          };

          return {
            success: true,
            updatedState,
            message: "Sent Dark Factory to graveyard",
          };
        },
      },
    ];
  }
}
