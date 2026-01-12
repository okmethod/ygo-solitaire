import type { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameStateUpdate";

/**
 * 通常召喚が可能かをチェックする
 *
 * チェック項目:
 * 1. メインフェイズであること
 * 2. モンスターゾーンに空きがあること
 * 3. 召喚権が残っていること
 *
 * Note: GameStateのみによる判定を責務とし、カードインスタンスが必要な判定はコマンドに委ねる
 */
export function canNormalSummon(state: GameState): ValidationResult {
  // 1. メインフェイズであること
  if (state.phase !== "Main1") {
    return { canExecute: false, reason: "メインフェイズではありません" };
  }

  // 2. モンスターゾーンに空きがあること
  if (state.zones.mainMonsterZone.length >= 5) {
    return { canExecute: false, reason: "モンスターゾーンに空きがありません" };
  }

  // 3. 召喚権が残っていること
  if (state.normalSummonUsed >= state.normalSummonLimit) {
    return { canExecute: false, reason: "召喚権がありません" };
  }

  return { canExecute: true };
}
