/**
 * Phase - 各種フェイズ
 *
 * 先行1ターン目のフェイズ進行のみをスコープとする。
 */

/** 全フェイズの順序付き配列 */
export const GAME_PHASES = ["draw", "standby", "main1", "end"] as const;
export type GamePhase = (typeof GAME_PHASES)[number];

/** 各フェイズの日本語名 */
export const PHASE_NAMES: Record<GamePhase, string> = {
  draw: "ドローフェイズ",
  standby: "スタンバイフェイズ",
  main1: "メインフェイズ",
  end: "エンドフェイズ",
} as const;

/** フェイズの日本語表示名 */
export const getPhaseDisplayName = (phase: GamePhase): string => {
  return PHASE_NAMES[phase];
};

/** 次のフェイズ */
export const getNextPhase = (currentPhase: GamePhase): GamePhase => {
  const currentIndex = GAME_PHASES.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === GAME_PHASES.length - 1) {
    return "end";
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
  return phase === "main1";
};

/** エンドフェイズかどうか */
export const isEndPhase = (phase: GamePhase): boolean => {
  return phase === "end";
};
