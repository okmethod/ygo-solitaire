/**
 * CardDestructionActivation - Card Destruction (手札断札) Quick-Play Spell activation
 *
 * Card Information:
 * - Card ID: 74519184
 * - Card Name: Card Destruction (手札断札)
 * - Card Type: Quick-Play Spell
 * - Effect: Both players discard 2 cards from their hand, then both players draw 2 cards.
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Hand >= 3 cards (spell + 2 to discard)
 * - ACTIVATION: Default activation step (provided by base class)
 * - RESOLUTION: Player discards 2 + Opponent discards 2 (internal) + Both draw 2 + Send spell to graveyard
 *
 * @module domain/effects/actions/spell/CardDestructionActivation
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { QuickPlaySpellAction } from "../../base/spell/QuickPlaySpellAction";
import { createDrawStep, createSendToGraveyardStep, createCardSelectionStep } from "../../builders/stepBuilders";
import { DiscardCardsCommand } from "../../../commands/DiscardCardsCommand";

/**
 * CardDestructionActivation - Card Destruction ChainableAction
 *
 * Extends QuickPlaySpellAction with Card Destruction specific logic.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(74519184, new CardDestructionActivation());
 *
 * // Usage in ActivateSpellCommand
 * const action = ChainableActionRegistry.get(74519184);
 * if (action && action.canActivate(state)) {
 *   const activationSteps = action.createActivationSteps(state);
 *   const resolutionSteps = action.createResolutionSteps(state, instanceId);
 *   // Application Layer handles execution
 * }
 * ```
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
   * 4. このカードを墓地に送る
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
              newState: currentState,
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
            newState: currentState,
            message: "Opponent discarded 2 cards (internal)",
          };
        },
      },

      // Step 3: Both players draw 2 cards
      createDrawStep(2, {
        id: "card-destruction-draw",
        description: "両プレイヤーがデッキから2枚ドローします",
      }),

      // Step 4: Send spell card to graveyard
      createSendToGraveyardStep(activatedCardInstanceId, this.cardId),
    ];
  }
}
