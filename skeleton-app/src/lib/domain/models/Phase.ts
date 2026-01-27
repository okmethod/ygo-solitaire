/**
 * Phase - フェイズモデル
 *
 * @module domain/models/Phase
 * @see {@link docs/domain/overview.md}
 */

/** フェイズ
 *
 * 先行1ターン目のフェイズ進行のみをスコープとする。
 */
export type GamePhase = "Draw" | "Standby" | "Main1" | "End";

/** 全フェイズの順序付き配列 */
const GAME_PHASES: readonly GamePhase[] = ["Draw", "Standby", "Main1", "End"] as const;

/** 各フェイズの日本語名 */
export const PHASE_NAMES: Record<GamePhase, string> = {
  Draw: "ドローフェイズ",
  Standby: "スタンバイフェイズ",
  Main1: "メインフェイズ",
  End: "エンドフェイズ",
} as const;

/** フェイズの日本語表示名 */
export const getPhaseDisplayName = (phase: GamePhase): string => {
  return PHASE_NAMES[phase];
};

/** 次のフェイズ */
export const getNextPhase = (currentPhase: GamePhase): GamePhase => {
  const currentIndex = GAME_PHASES.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === GAME_PHASES.length - 1) {
    return "End";
  }
  return GAME_PHASES[currentIndex + 1];
};

/** フェイズ遷移が有効か */
export const validatePhaseTransition = (
  currentPhase: GamePhase,
  nextPhase: GamePhase,
): { valid: boolean; error?: string } => {
  const expectedNext = getNextPhase(currentPhase);

  if (nextPhase !== expectedNext) {
    return {
      valid: false,
      error: `Invalid phase transition: ${currentPhase} → ${nextPhase}. Expected: ${expectedNext}`,
    };
  }

  return { valid: true };
};

/** メインフェイズかどうか */
export const isMainPhase = (phase: GamePhase): boolean => {
  return phase === "Main1";
};

/** エンドフェイズかどうか */
export const isEndPhase = (phase: GamePhase): boolean => {
  return phase === "End";
};
