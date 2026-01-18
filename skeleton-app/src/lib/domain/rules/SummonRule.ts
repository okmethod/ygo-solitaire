/**
 * SummonRule - 召喚ルール
 *
 * @module domain/rules/SummonRule
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import { ValidationErrorCode, validationSuccess, validationFailure } from "$lib/domain/models/ValidationResult";
import { isMainPhase } from "$lib/domain/models/Phase";
import { isMainMonsterZoneFull } from "$lib/domain/models/Zone";

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
  if (!isMainPhase(state.phase)) {
    return validationFailure(ValidationErrorCode.NOT_MAIN_PHASE);
  }

  // 2. モンスターゾーンに空きがあること
  if (isMainMonsterZoneFull(state.zones)) {
    return validationFailure(ValidationErrorCode.MONSTER_ZONE_FULL);
  }

  // 3. 召喚権が残っていること
  if (state.normalSummonUsed >= state.normalSummonLimit) {
    return validationFailure(ValidationErrorCode.SUMMON_LIMIT_REACHED);
  }

  return validationSuccess();
}
