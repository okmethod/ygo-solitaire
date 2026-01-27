/**
 * deckOperations.ts - デッキ操作系ステップビルダー
 *
 * 公開ステップ:
 * - shuffleDeckStep: デッキシャッフル
 *
 * @module domain/effects/steps/deckOperations
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { shuffleDeck } from "$lib/domain/models/Zone";

/** デッキをシャッフルするステップ*/
export const shuffleDeckStep = (): AtomicStep => {
  return {
    id: "shuffle-deck",
    summary: "デッキシャッフル",
    description: "デッキをシャッフルします",
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      const updatedState: GameState = {
        ...currentState,
        zones: shuffleDeck(currentState.zones),
      };

      return {
        success: true,
        updatedState,
        message: "Deck shuffled",
      };
    },
  };
};
