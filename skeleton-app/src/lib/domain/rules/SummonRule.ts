import type { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameStateUpdate";
import { isMainPhase } from "$lib/domain/rules/PhaseRule";

/**
 * 通常召喚が可能かをチェックする
 *
 * チェック項目:
 * 1. メインフェイズであること
 * 2. モンスターゾーンに空きがあること
 * 3. 召喚権が残っていること
 *
 * Note: GameStateのみによる判定を責務とし、カードインスタンスが必要な判定はコマンドに委ねる
 * TODO: ラッパーのようになってしまっても、エラーメッセージを共通化する目的という意味では有用。インスタンスを受け取るチェックも切り出して良いかも
 * メインフェイズ判定も随所でしているが、エラーメッセージのコントロールが煩雑化しているので、ここで一元化しても良いかも
 */
export function canNormalSummon(state: GameState): ValidationResult {
  // 1. メインフェイズであること
  if (!isMainPhase(state.phase)) {
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
