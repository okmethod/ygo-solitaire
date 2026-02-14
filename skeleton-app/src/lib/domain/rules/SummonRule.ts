/**
 * SummonRule - 召喚ルール
 *
 * @module domain/rules/SummonRule
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import type { BattlePosition } from "$lib/domain/models/CardOld";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { isMainPhase } from "$lib/domain/models/Phase";
import { moveCard, isMainMonsterZoneFull, findCardInstance } from "$lib/domain/models/Zone";

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
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
  }

  // 2. モンスターゾーンに空きがあること
  if (isMainMonsterZoneFull(state.zones)) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.MONSTER_ZONE_FULL);
  }

  // 3. 召喚権が残っていること
  if (state.normalSummonUsed >= state.normalSummonLimit) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.SUMMON_LIMIT_REACHED);
  }

  return GameProcessing.Validation.success();
}

/** モンスターを通常召喚する */
export function executeNormalSummon(
  state: GameState,
  cardInstanceId: string,
  battlePosition: BattlePosition,
): GameState {
  // モンスターカードを、メインモンスターゾーンに表側攻撃表示 or 裏側守備表示で配置する
  const card = findCardInstance(state.zones, cardInstanceId)!;
  const updatedZones = moveCard(state.zones, card, "mainMonsterZone", {
    stateOnField: {
      position: battlePosition === "attack" ? "faceUp" : "faceDown",
      battlePosition: battlePosition,
      counters: [],
      activatedEffects: new Set<string>(),
      placedThisTurn: true,
    },
  });

  return {
    ...state,
    zones: updatedZones,
    // 召喚権を1消費
    normalSummonUsed: state.normalSummonUsed + 1,
  };
}
