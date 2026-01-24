/**
 * OneDayOfPeaceActivation - 《一時休戦》(One Day of Peace)
 *
 * Card ID: 33782437 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、デッキに1枚以上
 * - ACTIVATION: 発動通知
 * - RESOLUTION: プレイヤーが1枚ドロー、相手が1枚ドロー（内部処理）、ダメージ無効化フラグ設定、墓地へ送る
 *
 * @module domain/effects/actions/spell/OneDayOfPeaceActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { drawStep } from "$lib/domain/effects/steps/draws";

/**
 * OneDayOfPeaceActivation
 *
 * Extends NormalSpellAction for One Day of Peace implementation.
 */
export class OneDayOfPeaceActivation extends NormalSpellAction {
  constructor() {
    super(33782437);
  }

  /**
   * Card-specific activation condition: Deck must have at least 1 card
   */
  protected individualConditions(state: GameState): boolean {
    return state.zones.deck.length >= 1;
  }

  /**
   * RESOLUTION: Draw 1 card (player), opponent draws (internal), damage negation
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: Player draws 1 card
      drawStep(1),

      // Step 2: Opponent draws 1 card (internal state only, no UI update)
      {
        id: "one-day-of-peace-draw-opponent",
        summary: "相手がドロー",
        description: "相手がデッキから1枚ドローします（内部状態のみ）",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // In 1-turn kill solitaire, opponent's hand is not tracked in UI
          // This step is for completeness and future compatibility
          // No actual state change needed for opponent's hand

          return {
            success: true,
            updatedState: currentState,
            message: "Opponent draw 1 card (internal)",
          };
        },
      },

      // Step 3: Set damageNegation flag to true
      {
        id: "one-day-of-peace-damage-negation",
        summary: "ダメージ無効化",
        description: "このターン、全てのダメージは0になります",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          const updatedState: GameState = {
            ...currentState,
            damageNegation: true,
          };

          return {
            success: true,
            updatedState,
            message: "Damage negation activated for this turn",
          };
        },
      },
    ];
  }
}
