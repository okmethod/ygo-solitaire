/**
 * GameResult - ゲーム終了後の勝敗情報
 */

import type { Player } from "./Player";

/** ゲーム終了理由 */
export const RESULT_REASONS = ["exodia", "lp0", "deckout", "surrender"] as const;
export type ResultReason = (typeof RESULT_REASONS)[number];

/** ゲーム結果（勝敗判定） */
export interface GameResult {
  readonly isGameOver: boolean;
  readonly winner?: Player | "draw";
  readonly reason?: ResultReason;
  readonly message?: string;
}
