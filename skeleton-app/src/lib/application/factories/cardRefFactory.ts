/**
 * cardRefFactory - CardInstance 変換ファクトリ
 *
 * ドメイン層の CardInstance をプレゼン層で使用する DTO に変換する。
 *
 * @module application/factories/cardRefFactory
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { CardInstanceRef, CardInstanceOnFieldRef } from "$lib/application/types/card";

/**
 * CardInstance を CardInstanceRef に変換する（フィールド外用）
 *
 * 手札・墓地・除外など、フィールド上の状態を持たないカード用。
 */
export function toInstanceRef(instance: CardInstance): CardInstanceRef {
  return {
    cardId: instance.id,
    instanceId: instance.instanceId,
  };
}

/**
 * CardInstance を CardInstanceOnFieldRef に変換する（フィールド上用）
 *
 * モンスターゾーン・魔法罠ゾーン・フィールドゾーンなど、フィールド上のカード用。
 */
export function toInstanceOnFieldRef(instance: CardInstance): CardInstanceOnFieldRef {
  return {
    cardId: instance.id,
    instanceId: instance.instanceId,
    position: instance.stateOnField?.position ?? "faceDown",
    battlePosition: instance.stateOnField?.battlePosition,
    counters: instance.stateOnField?.counters ?? [],
  };
}
