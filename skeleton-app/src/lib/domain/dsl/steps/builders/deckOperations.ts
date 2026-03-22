/**
 * deckOperations.ts - デッキ操作系ステップビルダー
 *
 * StepBuilder:
 * - shuffleDeckStepBuilder: デッキシャッフル
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilderFn } from "$lib/domain/dsl/types";

/** デッキをシャッフルするステップ*/
export const shuffleDeckStep = (): AtomicStep => {
  return {
    id: "shuffle-deck",
    summary: "デッキシャッフル",
    description: "デッキをシャッフルします",
    notificationLevel: "static",
    action: (currentState: GameSnapshot): GameStateUpdateResult => {
      const updatedState: GameSnapshot = {
        ...currentState,
        space: GameState.Space.shuffleMainDeck(currentState.space),
      };
      return GameProcessing.Result.success(updatedState, "Deck shuffled");
    },
  };
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SHUFFLE_DECK - デッキシャッフル
 * args: none
 */
export const shuffleDeckStepBuilder: StepBuilderFn = () => shuffleDeckStep();
