/**
 * fieldCardAdapter - フィールドカード表示データ変換
 *
 * CardDisplayStateOnField を FieldCardDisplayInfo に変換するアダプター。
 * 各ゾーンの共通変換ロジックを提供する。
 *
 * @module presentation/services/fieldCardAdapter
 */

import type { CardDisplayStateOnField } from "$lib/presentation/types";
import type { FieldCardDisplayInfo } from "$lib/presentation/types/card";
import { getCardDisplayData } from "$lib/presentation/services/cardDisplayDataCache";

/**
 * CardDisplayStateOnField を FieldCardDisplayInfo に変換する
 *
 * @param displayState - フィールド上のカード状態
 * @returns 表示用データ（カードが見つからない場合は null）
 */
export function toFieldCardDisplayInfo(displayState: CardDisplayStateOnField): FieldCardDisplayInfo | null {
  const card = getCardDisplayData(displayState.cardId);
  if (!card) return null;

  const spellCounter = displayState.counters.find((c) => c.type === "spell");

  return {
    card,
    instanceId: displayState.instanceId,
    faceDown: displayState.position === "faceDown",
    rotation: displayState.battlePosition === "defense" ? 270 : 0,
    spellCounterCount: spellCounter?.count ?? 0,
  };
}

/**
 * CardDisplayStateOnField 配列を固定長の FieldCardDisplayInfo 配列に変換する
 *
 * モンスターゾーン・魔法罠ゾーンなど、固定スロット数のゾーン用。
 *
 * @param displayStates - フィールド上のカード状態配列
 * @param slotCount - スロット数（デフォルト: 5）
 * @returns 固定長の配列（空スロットは null）
 */
export function toFixedSlotZone(
  displayStates: readonly CardDisplayStateOnField[],
  slotCount: number = 5,
): (FieldCardDisplayInfo | null)[] {
  const zone: (FieldCardDisplayInfo | null)[] = Array(slotCount).fill(null);

  displayStates.forEach((displayState, i) => {
    if (i < slotCount) {
      zone[i] = toFieldCardDisplayInfo(displayState);
    }
  });

  return zone;
}
