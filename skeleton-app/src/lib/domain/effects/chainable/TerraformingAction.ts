/**
 * TerraformingAction - Terraforming (テラフォーミング) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 73628505
 * - Card Name: Terraforming (テラフォーミング)
 * - Card Type: Normal Spell
 * - Effect: Add 1 Field Spell from your deck to your hand.
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Main Phase, Deck has >= 1 Field Spell
 * - ACTIVATION: No activation steps (normal spell has no activation cost)
 * - RESOLUTION: Select 1 Field Spell from deck + Add to hand + Send spell to graveyard
 *
 * @module domain/effects/chainable/TerraformingAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../../models/ChainableAction";
import type { GameState } from "../../models/GameState";
import type { EffectResolutionStep } from "../../models/EffectResolutionStep";
import { moveCard, sendToGraveyard } from "../../models/Zone";

/**
 * TerraformingAction - Terraforming ChainableAction
 *
 * Implements ChainableAction interface for Terraforming card.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(73628505, new TerraformingAction());
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
export class TerraformingAction implements ChainableAction {
  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase 1
   * - Deck has at least 1 Field Spell
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

    // Deck must have at least 1 Field Spell
    const fieldSpells = state.zones.deck.filter((card) => card.type === "spell" && card.spellType === "field");
    if (fieldSpells.length < 1) {
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
        id: "terraforming-activation",
        summary: "カード発動",
        description: "テラフォーミングを発動します",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            newState: currentState,
            message: "Terraforming activated",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. デッキからフィールド魔法1枚を選択
   * 2. 選択したフィールド魔法を手札に加える
   * 3. このカードを墓地に送る
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    // Filter deck for Field Spells only
    const fieldSpells = state.zones.deck.filter((card) => card.type === "spell" && card.spellType === "field");

    return [
      // Step 1: Select 1 Field Spell from deck
      {
        id: "terraforming-select",
        summary: "フィールド魔法を選択",
        description: "デッキからフィールド魔法1枚を選択してください",
        notificationLevel: "interactive",
        // Card selection configuration (Domain Layer)
        cardSelectionConfig: {
          availableCards: fieldSpells,
          minCards: 1,
          maxCards: 1,
          summary: "フィールド魔法を選択",
          description: "デッキからフィールド魔法1枚を選択してください",
          cancelable: false, // Cannot cancel during effect resolution
        },
        action: (currentState: GameState, selectedInstanceIds?: string[]) => {
          // Validate selectedInstanceIds is provided
          if (!selectedInstanceIds || selectedInstanceIds.length !== 1) {
            return {
              success: false,
              newState: currentState,
              error: "Must select exactly 1 Field Spell from deck",
            };
          }

          // Move selected Field Spell from deck to hand
          const updatedZones = moveCard(currentState.zones, selectedInstanceIds[0], "deck", "hand");

          const newState: GameState = {
            ...currentState,
            zones: updatedZones,
          };

          return {
            success: true,
            newState,
            message: "Added 1 Field Spell from deck to hand",
          };
        },
      },

      // Step 2: Send spell card to graveyard
      {
        id: "terraforming-graveyard",
        summary: "墓地へ送る",
        description: "テラフォーミングを墓地に送ります",
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
            message: "Sent Terraforming to graveyard",
          };
        },
      },
    ];
  }
}
