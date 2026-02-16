/**
 * deckOperations.ts - デッキ操作系ステップビルダー
 *
 * 公開ステップ:
 * - shuffleDeckStep: デッキシャッフル
 *
 * @module domain/effects/steps/deckOperations
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/** デッキをシャッフルするステップ*/
export const shuffleDeckStep = (): AtomicStep => {
  return {
    id: "shuffle-deck",
    summary: "デッキシャッフル",
    description: "デッキをシャッフルします",
    notificationLevel: "info",
    action: (currentState: GameSnapshot): GameStateUpdateResult => {
      const updatedState: GameSnapshot = {
        ...currentState,
        space: GameState.Space.shuffleMainDeck(currentState.space),
      };
      return GameProcessing.Result.success(updatedState, "Deck shuffled");
    },
  };
};
