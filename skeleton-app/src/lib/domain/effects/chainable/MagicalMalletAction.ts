/**
 * MagicalMalletAction - Magical Mallet (打ち出の小槌) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 85852291
 * - Card Name: Magical Mallet (打ち出の小槌)
 * - Card Type: Normal Spell
 * - Effect: Return any number of cards from your hand to the deck, shuffle the deck, then draw the same number of cards.
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Main Phase
 * - ACTIVATION: No activation steps (normal spell has no activation cost)
 * - RESOLUTION: Select cards + Return to deck + Shuffle notification + Draw same number + Send spell to graveyard
 *
 * @module domain/effects/chainable/MagicalMalletAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../../models/ChainableAction";
import type { GameState } from "../../models/GameState";
import type { EffectResolutionStep } from "../../models/EffectResolutionStep";
import { drawCards, sendToGraveyard, moveCard, shuffleDeck } from "../../models/Zone";
import { checkVictoryConditions } from "../../rules/VictoryRule";
import { getCardNameWithBrackets } from "../../registries/CardDataRegistry";

/**
 * MagicalMalletAction - Magical Mallet ChainableAction
 *
 * Implements ChainableAction interface for Magical Mallet card.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(85852291, new MagicalMalletAction());
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
export class MagicalMalletAction implements ChainableAction {
  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase 1
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

    // Magical Mallet can be activated even with empty hand (returns 0 cards)
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
        id: "magical-mallet-activation",
        summary: "カード発動",
        description: `${getCardNameWithBrackets(85852291)}を発動します`,
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            newState: currentState,
            message: "Magical Mallet activated",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. 手札から任意枚数のカードを選択
   * 2. 選択したカードをデッキに戻す
   * 3. デッキシャッフル（通知あり）
   * 4. 同じ枚数ドロー
   * 5. このカードを墓地に送る
   *
   * @param _state - 現在のゲーム状態（未使用、availableCardsは実行時に決定）
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Select cards to return (0 to hand.length)
      {
        id: "magical-mallet-select",
        summary: "手札を選択",
        description: "デッキに戻すカードを選択してください（0枚から全てまで選択可能）",
        notificationLevel: "interactive",
        // Card selection configuration (Domain Layer)
        cardSelectionConfig: {
          // Empty array means "use current hand" (allows selecting after drawing)
          availableCards: [],
          minCards: 0,
          maxCards: 100, // Will be capped by actual hand size
          summary: "手札を選択",
          description: "デッキに戻すカードを選択してください",
          cancelable: false, // Cannot cancel during effect resolution
        },
        action: (currentState: GameState, selectedInstanceIds?: string[]) => {
          const selectedCount = selectedInstanceIds?.length || 0;

          // Store selected count for next steps
          return {
            success: true,
            newState: {
              ...currentState,
              // Store selected count in temporary state (will be used in next step)
              metadata: { magicalMalletReturnCount: selectedCount, magicalMalletInstanceIds: selectedInstanceIds },
            } as GameState,
            message: `Selected ${selectedCount} cards to return`,
          };
        },
      },

      // Step 2: Return to deck + Shuffle
      {
        id: "magical-mallet-return-shuffle",
        summary: "デッキに戻してシャッフル",
        description: "選択したカードをデッキに戻し、デッキをシャッフルします",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          const stateMetadata = (currentState as GameState & { metadata?: Record<string, unknown> }).metadata || {};
          const selectedInstanceIds: string[] = (stateMetadata.magicalMalletInstanceIds as string[]) || [];

          if (selectedInstanceIds.length === 0) {
            return {
              success: true,
              newState: currentState,
              message: "No cards to return",
            };
          }

          // Return selected cards to deck
          let updatedZones = currentState.zones;
          for (const instanceId of selectedInstanceIds) {
            updatedZones = moveCard(updatedZones, instanceId, "hand", "deck");
          }

          // Shuffle deck
          updatedZones = shuffleDeck(updatedZones);

          const newState: GameState = {
            ...currentState,
            zones: updatedZones,
          };

          return {
            success: true,
            newState,
            message: `Returned ${selectedInstanceIds.length} cards to deck and shuffled`,
          };
        },
      },

      // Step 3: Draw cards
      {
        id: "magical-mallet-draw",
        summary: "カードをドロー",
        description: "デッキから同じ枚数ドローします",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          const stateMetadata = (currentState as GameState & { metadata?: Record<string, unknown> }).metadata || {};
          const drawCount: number = (stateMetadata.magicalMalletReturnCount as number) || 0;

          if (drawCount === 0) {
            // Clean up metadata
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { metadata, ...cleanState } = currentState as GameState & { metadata?: Record<string, unknown> };
            return {
              success: true,
              newState: cleanState as GameState,
              message: "No cards to draw",
            };
          }

          if (currentState.zones.deck.length < drawCount) {
            return {
              success: false,
              newState: currentState,
              error: `Cannot draw ${drawCount} cards. Only ${currentState.zones.deck.length} cards remaining in deck.`,
            };
          }

          const updatedZones = drawCards(currentState.zones, drawCount);

          // Create new state without metadata
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { metadata, ...baseState } = currentState as GameState & { metadata?: Record<string, unknown> };
          const newState: GameState = {
            ...(baseState as GameState),
            zones: updatedZones,
          };

          // Check victory conditions after drawing
          const victoryResult = checkVictoryConditions(newState);

          const finalState: GameState = {
            ...newState,
            result: victoryResult,
          };

          return {
            success: true,
            newState: finalState,
            message: `Drew ${drawCount} cards`,
          };
        },
      },

      // Step 4: Send spell card to graveyard
      {
        id: "magical-mallet-graveyard",
        summary: "墓地へ送る",
        description: `${getCardNameWithBrackets(85852291)}を墓地に送ります`,
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
            message: "Sent Magical Mallet to graveyard",
          };
        },
      },
    ];
  }
}
