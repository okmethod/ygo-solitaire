/**
 * draws.ts - ドロー系ステップビルダー
 *
 * 公開関数:
 * - drawStep: 指定枚数ドロー
 * - fillHandsStep: 手札が指定枚数になるまでドロー
 *
 * @module domain/effects/steps/draws
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { drawCards } from "$lib/domain/models/GameState/CardSpace";

// ドローステップの共通ヘルパー
const commonDrawStep = (
  calculateActualDrawCount: (state: GameSnapshot) => { drawCount: number; message: string },
  options: {
    id: string;
    summary: string;
    description: string;
  },
): AtomicStep => ({
  id: options.id,
  summary: options.summary,
  description: options.description,
  notificationLevel: "info",
  action: (state: GameSnapshot): GameStateUpdateResult => {
    const { drawCount, message } = calculateActualDrawCount(state);

    // ドロー不要なケース（fillHands用）
    if (drawCount === 0) {
      return GameProcessing.Result.success(state, message);
    }

    // デッキ不足バリデーション
    if (state.space.mainDeck.length < drawCount) {
      return GameProcessing.Result.failure(
        state,
        `Insufficient deck: needed ${drawCount}, but only ${state.space.mainDeck.length} remaining.`,
      );
    }

    // ドロー実行
    const updatedState = { ...state, space: drawCards(state.space, drawCount) };
    return GameProcessing.Result.success(updatedState, `${message} (${drawCount} card${drawCount > 1 ? "s" : ""})`);
  },
});

/** 指定枚数をドローするステップ */
export const drawStep = (count: number): AtomicStep =>
  commonDrawStep(() => ({ drawCount: count, message: `Draw ${count} card(s)` }), {
    id: `draw-${count}`,
    summary: "カードをドロー",
    description: `デッキから${count}枚ドローします`,
  });

/** 手札が指定枚数になるまでドローするステップ */
export const fillHandsStep = (targetCount: number): AtomicStep =>
  commonDrawStep(
    (state) => {
      const needed = Math.max(0, targetCount - state.space.hand.length);
      return {
        drawCount: needed,
        message: needed === 0 ? `Hand already has ${targetCount} or more cards` : `Filled hand to ${targetCount}`,
      };
    },
    {
      id: `fill-hands-${targetCount}`,
      summary: `手札が${targetCount}枚になるまでドロー`,
      description: `手札が${targetCount}枚になるまでドローします`,
    },
  );
