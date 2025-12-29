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
import type { EffectResolutionStep } from "../EffectResolutionStep";
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
   * 通常魔法はコストなし、対象なしのため、空配列を返す。
   *
   * @param state - 現在のゲーム状態
   * @returns 空配列（発動時の処理なし）
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createActivationSteps(state: GameState): EffectResolutionStep[] {
    // Normal Spell has no activation steps (no cost, no targeting)
    return [];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. デッキから3枚ドロー
   * 2. 手札から2枚選んで破棄
   * 3. このカードを墓地に送る
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Draw 3 cards
      {
        id: "graceful-charity-draw",
        title: "カードをドローします",
        message: "デッキから3枚ドローします",
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
        title: "カードを破棄します",
        message: "手札から2枚選んで破棄してください",
        // Card selection configuration (Domain Layer)
        // Application Layer will open CardSelectionModal with this config
        cardSelectionConfig: {
          availableCards: state.zones.hand,
          minCards: 2,
          maxCards: 2,
          title: "カードを破棄",
          message: "手札から2枚選んで破棄してください",
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
        title: "カードを墓地に送ります",
        message: "天使の施しを墓地に送ります",
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
