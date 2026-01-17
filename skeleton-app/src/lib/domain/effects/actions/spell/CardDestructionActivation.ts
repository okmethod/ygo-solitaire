/**
 * CardDestructionActivation - 《手札断札》(Card Destruction)
 *
 * Card ID: 74519184 | Type: Spell | Subtype: Quick-Play
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、手札が3枚以上（発動カード含む+捨てる2枚）
 * - ACTIVATION: 発動通知
 * - RESOLUTION: プレイヤーが2枚破棄、相手が2枚破棄（内部処理）、両者が2枚ドロー、墓地へ送る
 *
 * @module domain/effects/actions/spell/CardDestructionActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { QuickPlaySpellAction } from "../../base/spell/QuickPlaySpellAction";
import { createDrawStep, createCardSelectionStep } from "../../builders/stepBuilders";
import { DiscardCardsCommand } from "../../../commands/DiscardCardsCommand";

/**
 * CardDestructionActivation
 *
 * Extends QuickPlaySpellAction for Card Destruction implementation.
 */
export class CardDestructionActivation extends QuickPlaySpellAction {
  constructor() {
    super(74519184);
  }

  /**
   * Card-specific activation conditions
   *
   * - Hand must have at least 3 cards (spell + 2 to discard)
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  protected additionalActivationConditions(state: GameState): boolean {
    // Hand must have at least 3 cards (spell + 2 to discard)
    return state.zones.hand.length >= 3;
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. プレイヤーが手札から2枚選んで破棄
   * 2. 相手が手札から2枚破棄（内部状態のみ）
   * 3. 両プレイヤーが2枚ドロー
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Player discards 2 cards (player selection required, non-cancelable)
      createCardSelectionStep({
        id: "card-destruction-discard-player",
        summary: "手札を捨てる",
        description: "手札から2枚選んで捨ててください（キャンセル不可）",
        availableCards: state.zones.hand,
        minCards: 2,
        maxCards: 2,
        cancelable: false,
        onSelect: (currentState, selectedInstanceIds) => {
          // Validate selection
          if (selectedInstanceIds.length !== 2) {
            return {
              success: false,
              updatedState: currentState,
              error: "Must select exactly 2 cards to discard",
            };
          }

          // Execute discard command
          const command = new DiscardCardsCommand(selectedInstanceIds);
          return command.execute(currentState);
        },
      }),

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
            updatedState: currentState,
            message: "Opponent discarded 2 cards (internal)",
          };
        },
      },

      // Step 3: Both players draw 2 cards
      createDrawStep(2, {
        id: "card-destruction-draw",
        description: "両プレイヤーがデッキから2枚ドローします",
      }),
    ];
  }
}
