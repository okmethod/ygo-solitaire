/**
 * GracefulCharityAction - Graceful Charity (天使の施し) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 79571449
 * - Card Name: Graceful Charity (天使の施し)
 * - Card Type: Normal Spell
 * - Effect: Draw 3 cards from deck, then discard 2 cards from hand
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Main Phase, Deck >= 3 cards
 * - ACTIVATION: No activation steps (normal spell has no activation cost)
 * - RESOLUTION: Draw 3 cards + Discard 2 cards + Send spell card to graveyard
 *
 * @module domain/effects/chainable/GracefulCharityAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../../models/ChainableAction";
import type { GameState } from "../../models/GameState";
import type { EffectResolutionStep } from "../../models/EffectResolutionStep";
import { drawCards, sendToGraveyard } from "../../models/Zone";
import { checkVictoryConditions } from "../../rules/VictoryRule";
import { DiscardCardsCommand } from "../../commands/DiscardCardsCommand";

/**
 * GracefulCharityAction - Graceful Charity ChainableAction
 *
 * Implements ChainableAction interface for Graceful Charity card.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(79571449, new GracefulCharityAction());
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
export class GracefulCharityAction implements ChainableAction {
  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase 1
   * - Deck has at least 3 cards
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

    // Deck must have at least 3 cards
    if (state.zones.deck.length < 3) {
      return false;
    }

    return true;
  }

  /**
   * ACTIVATION: 発動時の処理
   *
   * 通常魔法はコストなし、対象なしのため、発動通知のみ。
   *
   * @param _state - 現在のゲーム状態（未使用）
   * @returns 発動通知ステップ
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createActivationSteps(_state: GameState): EffectResolutionStep[] {
    return [
      {
        id: "graceful-charity-activation",
        summary: "カード発動",
        description: "天使の施しを発動します",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            newState: currentState,
            message: "Graceful Charity activated",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. デッキから3枚ドロー
   * 2. 手札から2枚選んで破棄
   * 3. このカードを墓地に送る
   *
   * @param _state - 現在のゲーム状態（未使用、availableCardsは実行時に決定）
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Draw 3 cards
      {
        id: "graceful-charity-draw",
        summary: "カードをドロー",
        description: "デッキから3枚ドローします",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // Validate deck has enough cards
          if (currentState.zones.deck.length < 3) {
            return {
              success: false,
              newState: currentState,
              error: "Cannot draw 3 cards. Not enough cards in deck.",
            };
          }

          // Draw 3 cards (returns new immutable zones object)
          const newZones = drawCards(currentState.zones, 3);

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
            message: "Drew 3 cards",
          };
        },
      },

      // Step 2: Discard 2 cards (player selection required)
      {
        id: "graceful-charity-discard",
        summary: "手札を捨てる",
        description: "手札から2枚選んで捨ててください",
        notificationLevel: "interactive",
        // Card selection configuration (Domain Layer)
        // Application Layer will open CardSelectionModal with this config
        cardSelectionConfig: {
          // Empty array means "use current hand" (allows selecting newly drawn cards)
          availableCards: [],
          minCards: 2,
          maxCards: 2,
          summary: "手札を捨てる",
          description: "手札から2枚選んで捨ててください",
          cancelable: false, // Cannot cancel during effect resolution
        },
        // Action receives selected card instance IDs from user selection
        action: (currentState: GameState, selectedInstanceIds?: string[]) => {
          // Validate selectedInstanceIds is provided
          if (!selectedInstanceIds || selectedInstanceIds.length !== 2) {
            return {
              success: false,
              newState: currentState,
              error: "Must select exactly 2 cards to discard",
            };
          }

          // Execute discard command
          const command = new DiscardCardsCommand(selectedInstanceIds);
          return command.execute(currentState);
        },
      },

      // Step 3: Send spell card to graveyard
      {
        id: "graceful-charity-graveyard",
        summary: "墓地へ送る",
        description: "天使の施しを墓地に送ります",
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
            message: "Sent Graceful Charity to graveyard",
          };
        },
      },
    ];
  }
}
