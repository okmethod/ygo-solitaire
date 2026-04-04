/**
 * deckOperations.ts - デッキ操作系ステップビルダー
 *
 * StepBuilder:
 * - shuffleDeckStepBuilder: デッキシャッフル
 * - returnContextCardsToDeckShuffleStepBuilder: コンテキストのカードをデッキに戻しシャッフル
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { EffectId } from "$lib/domain/models/Effect";
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

/**
 * コンテキストに保存された対象カードを墓地からデッキに戻し、シャッフルするステップ
 *
 * 対象が墓地にいない場合はスキップ（不発処理）。
 */
export const returnContextCardsToDeckShuffleStep = (effectId: EffectId): AtomicStep => ({
  id: `return-context-cards-to-deck-shuffle`,
  summary: "対象カードをデッキに戻してシャッフル",
  description: "対象のカードをデッキに戻し、シャッフルします",
  notificationLevel: "silent",
  action: (state: GameSnapshot): GameStateUpdateResult => {
    const targets = GameState.ActivationContext.getTargets(state.activationContexts, effectId);
    if (targets.length === 0) {
      return GameProcessing.Result.failure(state, "No targets found in context");
    }

    let updatedSpace = state.space;
    let returnedCount = 0;
    for (const instanceId of targets) {
      const card = state.space.graveyard.find((c) => c.instanceId === instanceId);
      if (card) {
        updatedSpace = GameState.Space.moveCard(updatedSpace, card, "mainDeck");
        returnedCount++;
      }
    }

    updatedSpace = GameState.Space.shuffleMainDeck(updatedSpace);

    const clearedState: GameSnapshot = {
      ...state,
      space: updatedSpace,
      activationContexts: GameState.ActivationContext.clear(state.activationContexts, effectId),
    };

    return GameProcessing.Result.success(clearedState, `${returnedCount}枚のカードをデッキに戻し、シャッフルしました`);
  },
});

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SHUFFLE_DECK - デッキシャッフル
 * args: none
 */
export const shuffleDeckStepBuilder: StepBuilderFn = () => shuffleDeckStep();

/**
 * RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE - コンテキストのカードをデッキに戻しシャッフル
 * args: なし
 */
export const returnContextCardsToDeckShuffleStepBuilder: StepBuilderFn = (_args, context) => {
  if (!context.effectId) {
    throw new Error("RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE step requires effectId in context");
  }
  return returnContextCardsToDeckShuffleStep(context.effectId);
};
