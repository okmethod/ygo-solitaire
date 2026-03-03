/**
 * counters.ts - カウンター操作系ステップビルダー
 *
 * 公開関数:
 * - addCounterStep: 指定カードに指定タイプのカウンターを置く
 * - removeCounterStep: 指定カードから指定タイプのカウンターを取り除く
 *
 * @module domain/effects/steps/counters
 */

import type { CounterType } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/** 指定カードにカウンターを置くステップ */
export const addCounterStep = (
  targetInstanceId: string,
  counterType: CounterType,
  amount: number,
  limit?: number,
): AtomicStep => ({
  id: `add-counter-${counterType}-${amount}-${targetInstanceId}`,
  summary: "カウンターを置く",
  description: `${counterType === "spell" ? "魔力" : counterType}カウンターを${amount}つ置きます`,
  notificationLevel: "silent",
  action: (state: GameSnapshot) => {
    const targetCard = GameState.Space.findCard(state.space, targetInstanceId);

    if (!targetCard || !targetCard.stateOnField) {
      return GameProcessing.Result.success(state, "カードが見つかりません");
    }

    const currentCounters = targetCard.stateOnField.counters;
    const currentCount = Card.Counter.get(currentCounters, counterType);

    // 最大数チェック
    if (limit !== undefined && currentCount >= limit) {
      return GameProcessing.Result.success(state, "カウンターは既に最大数です");
    }

    // 上限を超えないように調整
    const actualAmount = limit !== undefined ? Math.min(amount, limit - currentCount) : amount;

    const updatedCounters = Card.Counter.update(currentCounters, counterType, actualAmount);
    const updatedStateOnField = { ...targetCard.stateOnField, counters: updatedCounters };
    const updatedSpace = GameState.Space.updateCardStateInPlace(state.space, targetCard, updatedStateOnField);

    return GameProcessing.Result.success(
      { ...state, space: updatedSpace },
      `${counterType === "spell" ? "魔力" : counterType}カウンターを${actualAmount}つ置きました`,
    );
  },
});

/** 指定カードからカウンターを取り除くステップ */
export const removeCounterStep = (targetInstanceId: string, counterType: CounterType, amount: number): AtomicStep => ({
  id: `remove-counter-${counterType}-${amount}-${targetInstanceId}`,
  summary: "カウンターを取り除く",
  description: `${counterType === "spell" ? "魔力" : counterType}カウンターを${amount}つ取り除きます`,
  notificationLevel: "info",
  action: (state: GameSnapshot) => {
    const targetCard = GameState.Space.findCard(state.space, targetInstanceId);

    if (!targetCard || !targetCard.stateOnField) {
      return GameProcessing.Result.failure(state, `Target card not found: ${targetInstanceId}`);
    }

    const currentCounters = targetCard.stateOnField.counters;
    const currentCount = Card.Counter.get(currentCounters, counterType);

    // カウンター数チェック
    if (currentCount < amount) {
      return GameProcessing.Result.failure(
        state,
        `Insufficient counters: needed ${amount}, but only ${currentCount} available.`,
      );
    }

    // 負のdeltaで削除
    const updatedCounters = Card.Counter.update(currentCounters, counterType, -amount);
    const updatedStateOnField = { ...targetCard.stateOnField, counters: updatedCounters };
    const updatedSpace = GameState.Space.updateCardStateInPlace(state.space, targetCard, updatedStateOnField);

    return GameProcessing.Result.success(
      { ...state, space: updatedSpace },
      `Removed ${amount} ${counterType} counter(s) from card.`,
    );
  },
});
