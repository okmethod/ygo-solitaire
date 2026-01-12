import type { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameStateUpdate";

/**
 * 通常召喚が可能かをチェックする
 *
 * チェック項目:
 * 1. メインフェーズ1であること
 * 2. 召喚権が残っていること
 * 3. モンスターゾーンに空きがあること
 *
 * Note: GameStateのみによる判定を責務とし、カードインスタンスが必要な判定はコマンドに委ねる
 */
export function canNormalSummon(state: GameState): ValidationResult {
  // 1. メインフェーズ1であること
  if (state.phase !== "Main1") {
    return { canExecute: false, reason: "Main1フェーズではありません" };
  }

  // 2. 召喚権が残っていること
  if (state.normalSummonUsed >= state.normalSummonLimit) {
    return { canExecute: false, reason: "召喚権がありません" };
  }

  // 3. モンスターゾーンに空きがあること
  if (state.zones.mainMonsterZone.length >= 5) {
    return { canExecute: false, reason: "モンスターゾーンが満杯です" };
  }

  return { canExecute: true };
}
