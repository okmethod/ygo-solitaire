/**
 * CeasefireVariantAction - Ceasefire Variant (一時休戦) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 33782437
 * - Card Name: Ceasefire Variant (一時休戦)
 * - Card Type: Normal Spell
 * - Effect: Both players draw 1 card. All battle and effect damage becomes 0 for the rest of this turn.
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Main Phase, Deck >= 1 card
 * - ACTIVATION: No activation steps (normal spell has no activation cost)
 * - RESOLUTION: Player draws 1 + Opponent draws 1 (internal) + Set damageNegation flag + Send spell to graveyard
 *
 * Note: Opponent's draw is internal state only (no UI update, as opponent's hand is not displayed)
 *
 * @module domain/effects/chainable/CeasefireVariantAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../../models/ChainableAction";
import type { GameState } from "../../models/GameState";
import type { EffectResolutionStep } from "../../models/EffectResolutionStep";
import { drawCards, sendToGraveyard } from "../../models/Zone";
import { checkVictoryConditions } from "../../rules/VictoryRule";

/**
 * CeasefireVariantAction - Ceasefire Variant ChainableAction
 *
 * Implements ChainableAction interface for Ceasefire Variant card.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(33782437, new CeasefireVariantAction());
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
export class CeasefireVariantAction implements ChainableAction {
  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase 1
   * - Deck has at least 1 card (for player to draw)
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

    // Deck must have at least 1 card for player to draw
    if (state.zones.deck.length < 1) {
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
        id: "ceasefire-activation",
        summary: "カード発動",
        description: "一時休戦を発動します",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            newState: currentState,
            message: "Ceasefire Variant activated",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. プレイヤーがデッキから1枚ドロー
   * 2. 相手がデッキから1枚ドロー（内部状態のみ、UI非表示）
   * 3. damageNegationフラグをtrueに設定
   * 4. このカードを墓地に送る
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Player draws 1 card
      {
        id: "ceasefire-draw-player",
        summary: "カードをドロー",
        description: "デッキから1枚ドローします",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // Validate deck has enough cards
          if (currentState.zones.deck.length < 1) {
            return {
              success: false,
              newState: currentState,
              error: "Cannot draw 1 card. Not enough cards in deck.",
            };
          }

          // Draw 1 card (returns new immutable zones object)
          const newZones = drawCards(currentState.zones, 1);

          // Create new state with drawn card
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
            message: "Drew 1 card",
          };
        },
      },

      // Step 2: Opponent draws 1 card (internal state only, no UI update)
      {
        id: "ceasefire-draw-opponent",
        summary: "相手がドロー",
        description: "相手がデッキから1枚ドローします（内部状態のみ）",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // In 1-turn kill solitaire, opponent's hand is not tracked in UI
          // This step is for completeness and future compatibility
          // No actual state change needed for opponent's hand

          return {
            success: true,
            newState: currentState,
            message: "Opponent drew 1 card (internal)",
          };
        },
      },

      // Step 3: Set damageNegation flag to true
      {
        id: "ceasefire-damage-negation",
        summary: "ダメージ無効化",
        description: "このターン、全てのダメージは0になります",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          const newState: GameState = {
            ...currentState,
            damageNegation: true,
          };

          return {
            success: true,
            newState,
            message: "Damage negation activated for this turn",
          };
        },
      },

      // Step 4: Send spell card to graveyard
      {
        id: "ceasefire-graveyard",
        summary: "墓地へ送る",
        description: "一時休戦を墓地に送ります",
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
            message: "Sent Ceasefire Variant to graveyard",
          };
        },
      },
    ];
  }
}
