import type { GamePhase } from "$lib/domain/models/Phase";
import { getNextPhase } from "$lib/domain/models/Phase";

/** フェイズの日本語表示名を取得する */
export function getPhaseDisplayName(phase: GamePhase): string {
  const phaseNames: Record<GamePhase, string> = {
    Draw: "ドローフェイズ",
    Standby: "スタンバイフェイズ",
    Main1: "メインフェイズ",
    End: "エンドフェイズ",
  };
  return phaseNames[phase];
}

/** フェイズ遷移が有効かを検証する */
export function validatePhaseTransition(
  currentPhase: GamePhase,
  nextPhase: GamePhase,
): { valid: boolean; error?: string } {
  const expectedNext = getNextPhase(currentPhase);

  if (nextPhase !== expectedNext) {
    return {
      valid: false,
      error: `Invalid phase transition: ${currentPhase} → ${nextPhase}. Expected: ${expectedNext}`,
    };
  }

  return { valid: true };
}

/**
 * メインフェイズかどうかを判定する
 */
export function isMainPhase(phase: GamePhase): boolean {
  return phase === "Main1";
}

/** エンドフェイズかどうかを判定する */
export function isEndPhase(phase: GamePhase): boolean {
  return phase === "End";
}
