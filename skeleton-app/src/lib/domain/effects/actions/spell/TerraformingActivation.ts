/**
 * TerraformingActivation - 《テラ・フォーミング》(Terraforming)
 *
 * Card ID: 73628505 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、デッキにフィールド魔法が1枚以上
 * - ACTIVATION: 発動通知のみ
 * - RESOLUTION: デッキからフィールド魔法1枚を選択、手札に加える、墓地へ送る
 *
 * @module domain/effects/actions/spell/TerraformingActivation
 */

import type { ChainableAction } from "../../../models/ChainableAction";
import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { moveCard, sendToGraveyard } from "../../../models/Zone";
import { getCardNameWithBrackets } from "../../../registries/CardDataRegistry";

/**
 * TerraformingActivation
 *
 * Implements ChainableAction for Terraforming implementation.
 */
export class TerraformingActivation implements ChainableAction {
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
        description: `${getCardNameWithBrackets(73628505)}を発動します`,
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

    // NOTE: Dynamic card name in notification
    // Step 2's description uses a generic message "選択したフィールド魔法を手札に加えます"
    // instead of the specific card name like "《チキンレース》を手札に加えます"
    // because descriptions are evaluated at step creation time (when createResolutionSteps is called),
    // not at step execution time (when the action runs).
    // To display the specific card name, we would need to either:
    // 1. Change EffectResolutionStep.description to support functions: `description: string | (() => string)`
    // 2. Dynamically update Step 2's description from within Step 1's action
    // 3. Accept the generic message for better maintainability (current approach)

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

      // Step 2: Notification for adding to hand
      {
        id: "terraforming-add-to-hand",
        summary: "手札に加える",
        description: "選択したフィールド魔法を手札に加えます",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            newState: currentState,
            message: "Added Field Spell to hand",
          };
        },
      },

      // Step 3: Send spell card to graveyard
      {
        id: "terraforming-graveyard",
        summary: "墓地へ送る",
        description: `${getCardNameWithBrackets(73628505)}を墓地に送ります`,
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
