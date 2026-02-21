/**
 * displayInstanceAdapter - フィールドカード表示データ変換
 *
 * CardInstanceOnFieldRef を DisplayCardInstanceOnField に変換するアダプター。
 * 各ゾーンの共通変換ロジックを提供する。
 *
 * @module presentation/services/displayInstanceAdapter
 */

import type { CardInstanceOnFieldRef, DisplayCardInstanceOnField } from "$lib/presentation/types";
import { getDisplayCardData } from "$lib/presentation/services/displayDataCache";

/**
 * CardInstanceOnFieldRef を DisplayCardInstanceOnField に変換する
 *
 * @param instanceOnFieldRef - フィールド上のカード参照
 * @returns 表示用データ（カードが見つからない場合は null）
 */
export function toDisplayCardInstanceOnField(
  instanceOnFieldRef: CardInstanceOnFieldRef,
): DisplayCardInstanceOnField | null {
  const card = getDisplayCardData(instanceOnFieldRef.cardId);
  if (!card) return null;

  const spellCounter = instanceOnFieldRef.counters.find((c) => c.type === "spell");

  return {
    card,
    instanceId: instanceOnFieldRef.instanceId,
    faceDown: instanceOnFieldRef.position === "faceDown",
    rotation: instanceOnFieldRef.battlePosition === "defense" ? 270 : 0,
    spellCounterCount: spellCounter?.count ?? 0,
  };
}

/**
 * CardInstanceOnFieldRef 配列を固定長の DisplayCardInstanceOnField 配列に変換する
 *
 * モンスターゾーン・魔法罠ゾーンなど、固定スロット数のゾーン用。
 *
 * @param instanceOnFieldRefs - フィールド上のカード参照配列
 * @param slotCount - スロット数（デフォルト: 5）
 * @returns 固定長の配列（空スロットは null）
 */
export function toFixedSlotZone(
  instanceOnFieldRefs: readonly CardInstanceOnFieldRef[],
  slotCount: number = 5,
): (DisplayCardInstanceOnField | null)[] {
  const zone: (DisplayCardInstanceOnField | null)[] = Array(slotCount).fill(null);

  instanceOnFieldRefs.forEach((ref, i) => {
    if (i < slotCount) {
      zone[i] = toDisplayCardInstanceOnField(ref);
    }
  });

  return zone;
}
