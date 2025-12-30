/**
 * UpstartGoblinAction - Upstart Goblin (成金ゴブリン) ChainableAction implementation
 *
 * Card Information:
 * - Card ID: 70368879
 * - Card Name: Upstart Goblin (成金ゴブリン)
 * - Card Type: Normal Spell
 * - Effect: Draw 1 card from your deck. Your opponent gains 1000 LP.
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Main Phase, Deck >= 1 card
 * - ACTIVATION: No activation steps (normal spell has no activation cost)
 * - RESOLUTION: Draw 1 card + Opponent gains 1000 LP + Send spell card to graveyard
 *
 * @module domain/effects/chainable/UpstartGoblinAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../../models/ChainableAction";
import type { GameState } from "../../models/GameState";
import type { EffectResolutionStep } from "../../models/EffectResolutionStep";
import { drawCards, sendToGraveyard } from "../../models/Zone";
import { checkVictoryConditions } from "../../rules/VictoryRule";

/**
 * UpstartGoblinAction - Upstart Goblin ChainableAction
 *
 * Implements ChainableAction interface for Upstart Goblin card.
 *
 * @example
 * ```typescript
 * // Register in ChainableActionRegistry
 * ChainableActionRegistry.register(70368879, new UpstartGoblinAction());
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
export class UpstartGoblinAction implements ChainableAction {
  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase 1
   * - Deck has at least 1 card
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

    // Deck must have at least 1 card
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
        id: "upstart-goblin-activation",
        summary: "カード発動",
        description: "成金ゴブリンを発動します",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            newState: currentState,
            message: "Upstart Goblin activated",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. デッキから1枚ドロー
   * 2. 相手のLPを1000増加
   * 3. このカードを墓地に送る
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Step 1: Draw 1 card
      {
        id: "upstart-goblin-draw",
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

      // Step 2: Opponent gains 1000 LP
      {
        id: "upstart-goblin-lp-gain",
        summary: "相手のLPを増加",
        description: "相手のLPが1000増加します",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          const newState: GameState = {
            ...currentState,
            lp: {
              ...currentState.lp,
              opponent: currentState.lp.opponent + 1000,
            },
          };

          return {
            success: true,
            newState,
            message: "Opponent gained 1000 LP",
          };
        },
      },

      // Step 3: Send spell card to graveyard
      {
        id: "upstart-goblin-graveyard",
        summary: "墓地へ送る",
        description: "成金ゴブリンを墓地に送ります",
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
            message: "Sent Upstart Goblin to graveyard",
          };
        },
      },
    ];
  }
}
