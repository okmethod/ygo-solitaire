/**
 * counters.ts - カウンター操作系ステップビルダー
 *
 * 公開関数:
 * - addCounterStep: 指定カードに指定タイプのカウンターを置く
 * - removeCounterStep: 指定カードから指定タイプのカウンターを取り除く
 *
 * @module domain/effects/steps/counters
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { CounterType } from "$lib/domain/models/Counter";
import { updateCounters, getCounterCount } from "$lib/domain/models/Counter";
import { successUpdateResult, failureUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { findCardInstance, updateCardInPlace } from "$lib/domain/models/Zone";

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
  action: (state: GameState) => {
    const targetCard = findCardInstance(state.zones, targetInstanceId);

    if (!targetCard) {
      return successUpdateResult(state, "カードが見つかりません");
    }

    const currentCount = getCounterCount(targetCard.counters, counterType);

    // 最大数チェック
    if (limit !== undefined && currentCount >= limit) {
      return successUpdateResult(state, "カウンターは既に最大数です");
    }

    // 上限を超えないように調整
    const actualAmount = limit !== undefined ? Math.min(amount, limit - currentCount) : amount;

    const updatedCounters = updateCounters(targetCard.counters, counterType, actualAmount);
    const updatedZones = updateCardInPlace(state.zones, targetCard, { counters: updatedCounters });

    return successUpdateResult(
      { ...state, zones: updatedZones },
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
  action: (state: GameState) => {
    const targetCard = findCardInstance(state.zones, targetInstanceId);

    if (!targetCard) {
      return failureUpdateResult(state, `Target card not found: ${targetInstanceId}`);
    }

    // カウンター数チェック
    const currentCount = getCounterCount(targetCard.counters, counterType);
    if (currentCount < amount) {
      return failureUpdateResult(state, `Insufficient counters: needed ${amount}, but only ${currentCount} available.`);
    }

    // 負のdeltaで削除
    const updatedCounters = updateCounters(targetCard.counters, counterType, -amount);
    const updatedZones = updateCardInPlace(state.zones, targetCard, { counters: updatedCounters });

    return successUpdateResult(
      { ...state, zones: updatedZones },
      `Removed ${amount} ${counterType} counter(s) from card.`,
    );
  },
});
