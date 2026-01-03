import type { GameState } from "../models/GameState";

export interface SummonValidation {
  canSummon: boolean;
  reason?: string;
}

/**
 * 通常召喚が可能かをチェックする
 * @param state - 現在のゲーム状態
 * @returns 召喚可否とその理由
 */
export function canNormalSummon(state: GameState): SummonValidation {
  if (state.phase !== "Main1") {
    return { canSummon: false, reason: "Main1フェーズではありません" };
  }

  if (state.normalSummonUsed >= state.normalSummonLimit) {
    return { canSummon: false, reason: "召喚権がありません" };
  }

  if (state.zones.mainMonsterZone.length >= 5) {
    return { canSummon: false, reason: "モンスターゾーンが満杯です" };
  }

  return { canSummon: true };
}
