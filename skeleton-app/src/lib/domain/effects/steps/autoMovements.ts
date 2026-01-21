/**
 * autoMovements.ts - ユーザーの操作を伴わないカード移動系ステップビルダー
 *
 * 公開関数:
 * - drawStep: 指定枚数ドロー
 * - fillHandsStep: 手札が指定枚数になるまでドロー
 *
 * @module domain/effects/steps/autoMovements
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { drawCards } from "$lib/domain/models/Zone";

// ドローステップの共通ヘルパー
const commonDrawStep = (
  calculateCount: (state: GameState) => { drawCount: number; message: string },
  options: {
    id?: string;
    summary?: string;
    description?: string;
  },
  defaultId: string,
): AtomicStep => ({
  id: options.id ?? defaultId,
  summary: options.summary ?? "カードをドロー",
  description: options.description ?? "デッキからカードをドローします",
  notificationLevel: "info",
  action: (state: GameState): GameStateUpdateResult => {
    const { drawCount, message } = calculateCount(state);

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

    return {
      success: true,
      updatedState: { ...state, zones: drawCards(state.zones, drawCount) },
      message: `${message} (${drawCount} card${drawCount > 1 ? "s" : ""})`,
    };
  },
});

/** 指定枚数をドローするステップ */
export const drawStep = (
  count: number,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): AtomicStep =>
  commonDrawStep(
    () => ({ drawCount: count, message: `Drew ${count} card(s)` }),
    {
      summary: "カードをドロー",
      description: `デッキから${count}枚ドローします`,
      ...options,
    },
    `draw-${count}`,
  );

/** 手札が指定枚数になるまでドローするステップ */
export const fillHandsStep = (
  targetCount: number,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): AtomicStep =>
  commonDrawStep(
    (state) => {
      const needed = Math.max(0, targetCount - state.zones.hand.length);
      return {
        drawCount: needed,
        message: needed === 0 ? `Hand already has ${targetCount} or more cards` : `Filled hand to ${targetCount}`,
      };
    },
    {
      summary: `手札が${targetCount}枚になるまでドロー`,
      description: `手札が${targetCount}枚になるまでドローします`,
      ...options,
    },
    `fill-hands-${targetCount}`,
  );
