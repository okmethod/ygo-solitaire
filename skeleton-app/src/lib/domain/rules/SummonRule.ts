/**
 * SummonRule - 召喚ルール
 *
 * @module domain/rules/SummonRule
 */

import type { BattlePosition } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

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
export function canNormalSummon(state: GameSnapshot): ValidationResult {
  // 1. メインフェイズであること
  if (!GameState.Phase.isMain(state.phase)) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
  }

  // 2. モンスターゾーンに空きがあること
  if (GameState.Space.isMainMonsterZoneFull(state.space)) {
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
  state: GameSnapshot,
  cardInstanceId: string,
  battlePosition: BattlePosition,
): GameSnapshot {
  // モンスターカードを、メインモンスターゾーンに表側攻撃表示 or 裏側守備表示で配置する
  const card = GameState.Space.findCard(state.space, cardInstanceId)!;
  const updatedSpace = GameState.Space.moveCard(state.space, card, "mainMonsterZone", {
    position: battlePosition === "attack" ? "faceUp" : "faceDown",
    battlePosition: battlePosition,
  });

  return {
    ...state,
    space: updatedSpace,
    // 召喚権を1消費
    normalSummonUsed: state.normalSummonUsed + 1,
  };
}
