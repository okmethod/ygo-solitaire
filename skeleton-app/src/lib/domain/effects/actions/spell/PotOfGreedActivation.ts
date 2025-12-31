/**
 * PotOfGreedActivation - Pot of Greed (強欲な壺) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 55144522
 * - Card Name: Pot of Greed (強欲な壺)
 * - Card Type: Normal Spell
 * - Effect: Draw 2 cards from your deck
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Main Phase, Deck >= 2 cards
 * - ACTIVATION: No activation steps (normal spell has no activation cost)
 * - RESOLUTION: Draw 2 cards + Send spell card to graveyard
 *
 * @module domain/effects/actions/spell/PotOfGreedActivation
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../../../models/ChainableAction";
import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { drawCards, sendToGraveyard } from "../../../models/Zone";
import { checkVictoryConditions } from "../../../rules/VictoryRule";

/**
 * PotOfGreedActivation - Pot of Greed ChainableAction
 *
 * Implements ChainableAction interface for Pot of Greed card.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(55144522, new PotOfGreedActivation());
 *
 * // Usage in ActivateSpellCommand
 * const action = ChainableActionRegistry.get(cardId);
 * if (action && action.canActivate(state)) {
 *   const activationSteps = action.createActivationSteps(state);
 *   const resolutionSteps = action.createResolutionSteps(state, instanceId);
 *   // Application Layer handles execution
 * }
 * ```
 */
export class PotOfGreedActivation implements ChainableAction {
  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase 1
   * - Deck has at least 2 cards
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

    // Deck must have at least 2 cards
    if (state.zones.deck.length < 2) {
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
        id: "pot-of-greed-activation",
        summary: "カード発動",
        description: "強欲な壺を発動します",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            newState: currentState,
            message: "Pot of Greed activated",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. デッキから2枚ドロー
   * 2. このカードを墓地に送る
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Draw 2 cards
      {
        id: "pot-of-greed-draw",
        summary: "カードをドロー",
        description: "デッキから2枚ドローします",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // Validate deck has enough cards
          if (currentState.zones.deck.length < 2) {
            return {
              success: false,
              newState: currentState,
              error: "Cannot draw 2 cards. Not enough cards in deck.",
            };
          }

          // Draw 2 cards (returns new immutable zones object)
          const newZones = drawCards(currentState.zones, 2);

          // Create new state with drawn cards
          const newState: GameState = {
            ...currentState,
            zones: newZones,
          };

          // Check victory conditions after drawing
          const victoryResult = checkVictoryConditions(newState);

          // Update game result if victory/defeat occurred
          const finalState: GameState = {
            ...newState,
            result: victoryResult,
          };

          return {
            success: true,
            newState: finalState,
            message: "Drew 2 cards",
          };
        },
      },

      // Step 2: Send spell card to graveyard
      {
        id: "pot-of-greed-graveyard",
        summary: "墓地へ送る",
        description: "強欲な壺を墓地に送ります",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // Send activated spell card to graveyard
          const newZones = sendToGraveyard(currentState.zones, activatedCardInstanceId);

          const newState: GameState = {
            ...currentState,
            zones: newZones,
          };

          return {
            success: true,
            newState,
            message: "Sent Pot of Greed to graveyard",
          };
        },
      },
    ];
  }
}
