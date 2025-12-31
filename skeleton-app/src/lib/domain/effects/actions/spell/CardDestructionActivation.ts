/**
 * CardDestructionAction - Card Destruction (手札断札) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 74519184
 * - Card Name: Card Destruction (手札断札)
 * - Card Type: Quick-Play Spell
 * - Effect: Both players discard 2 cards from their hand, then both players draw 2 cards.
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Main Phase, Hand >= 3 cards (spell + 2 to discard)
 * - ACTIVATION: No activation steps (Quick-Play spell has no activation cost)
 * - RESOLUTION: Player discards 2 + Opponent discards 2 (internal) + Both draw 2 + Send spell to graveyard
 *
 * @module domain/effects/chainable/CardDestructionAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../../../models/ChainableAction";
import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { drawCards, sendToGraveyard } from "../../../models/Zone";
import { checkVictoryConditions } from "../../../rules/VictoryRule";
import { DiscardCardsCommand } from "../../../commands/DiscardCardsCommand";

/**
 * CardDestructionAction - Card Destruction ChainableAction
 *
 * Implements ChainableAction interface for Card Destruction card.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(74519184, new CardDestructionAction());
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
export class CardDestructionActivation implements ChainableAction {
  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード2（速攻魔法） */
  readonly spellSpeed = 2 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase 1
   * - Hand has at least 3 cards (spell + 2 to discard)
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

    // Hand must have at least 3 cards (spell + 2 to discard)
    if (state.zones.hand.length < 3) {
      return false;
    }

    return true;
  }

  /**
   * ACTIVATION: 発動時の処理
   *
   * 速攻魔法はコストなし、対象なしのため、発動通知のみ。
   *
   * @param state - 現在のゲーム状態
   * @returns 発動通知ステップ
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createActivationSteps(state: GameState): EffectResolutionStep[] {
    return [
      {
        id: "card-destruction-activation",
        summary: "カード発動",
        description: "手札断札を発動します",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            newState: currentState,
            message: "Card Destruction activated",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. プレイヤーが手札から2枚選んで破棄
   * 2. 相手が手札から2枚破棄（内部状態のみ）
   * 3. 両プレイヤーが2枚ドロー
   * 4. このカードを墓地に送る
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Player discards 2 cards (player selection required, non-cancelable)
      {
        id: "card-destruction-discard-player",
        summary: "手札を捨てる",
        description: "手札から2枚選んで捨ててください",
        notificationLevel: "interactive",
        // Card selection configuration (Domain Layer)
        cardSelectionConfig: {
          availableCards: state.zones.hand,
          minCards: 2,
          maxCards: 2,
          summary: "手札を捨てる",
          description: "手札から2枚選んで捨ててください（キャンセル不可）",
          cancelable: false, // Cannot cancel during effect resolution
        },
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

      // Step 2: Opponent discards 2 cards (internal state only, no UI update)
      {
        id: "card-destruction-discard-opponent",
        summary: "相手が手札を捨てる",
        description: "相手が手札から2枚捨てます（内部状態のみ）",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // In 1-turn kill solitaire, opponent's hand is not tracked in UI
          // This step is for completeness and future compatibility
          // No actual state change needed for opponent's hand

          return {
            success: true,
            newState: currentState,
            message: "Opponent discarded 2 cards (internal)",
          };
        },
      },

      // Step 3: Both players draw 2 cards
      {
        id: "card-destruction-draw",
        summary: "カードをドロー",
        description: "両プレイヤーがデッキから2枚ドローします",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // Validate deck has enough cards for player to draw
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
            message: "Both players drew 2 cards",
          };
        },
      },

      // Step 4: Send spell card to graveyard
      {
        id: "card-destruction-graveyard",
        summary: "墓地へ送る",
        description: "手札断札を墓地に送ります",
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
            message: "Sent Card Destruction to graveyard",
          };
        },
      },
    ];
  }
}
