/**
 * draws.ts - ドロー系ステップビルダー
 *
 * 公開関数:
 * - drawStep: 指定枚数ドロー
 * - fillHandsStep: 手札が指定枚数になるまでドロー
 *
 * @module domain/effects/steps/draws
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { drawCards } from "$lib/domain/models/Zone";

// ドローステップの共通ヘルパー
const commonDrawStep = (
  calculateActualDrawCount: (state: GameState) => { drawCount: number; message: string },
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
  action: (state: GameState): GameStateUpdateResult => {
    const { drawCount, message } = calculateActualDrawCount(state);

    // ドロー不要なケース（fillHands用）
    if (drawCount === 0) {
      return { success: true, updatedState: state, message };
    }

    // デッキ不足バリデーション
    if (state.zones.deck.length < drawCount) {
      return {
        success: false,
        updatedState: state,
        error: `Insufficient deck: needed ${drawCount}, but only ${state.zones.deck.length} remaining.`,
      };
    }

    // ドロー実行
    return {
      success: true,
      updatedState: { ...state, zones: drawCards(state.zones, drawCount) },
      message: `${message} (${drawCount} card${drawCount > 1 ? "s" : ""})`,
    };
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
      const needed = Math.max(0, targetCount - state.zones.hand.length);
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
