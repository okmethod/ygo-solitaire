/**
 * Zone - 領域モデル
 *
 * ゲーム中にカードが配置される領域を表現するモデル。
 * 領域間でのカード移動や状態管理のためのユーティリティ関数も提供する。
 *
 * @module domain/models/Zone
 * @see {@link docs/domain/overview.md}
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { shuffleArray } from "$lib/shared/utils/arrayUtils";

/** カードが配置される全ての領域 */
export interface Zones {
  readonly deck: readonly CardInstance[];
  // TODO: メインデッキとエクストラデッキを分離する
  // readonly mainDeck: readonly CardInstance[];
  // readonly extraDeck: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly mainMonsterZone: readonly CardInstance[];
  readonly spellTrapZone: readonly CardInstance[];
  readonly fieldZone: readonly CardInstance[];
  readonly graveyard: readonly CardInstance[];
  readonly banished: readonly CardInstance[];
}

/** ゾーン名 */
export type ZoneName = keyof Zones;

/** カードの移動および表示形式を変更を行う（汎用）*/
export function moveCard(
  currentZones: Zones,
  instanceId: string,
  from: keyof Zones,
  to: keyof Zones,
  updates?: Partial<CardInstance>,
): Zones {
  const sourceZone = currentZones[from];
  const cardIndex = sourceZone.findIndex((card) => card.instanceId === instanceId);

  if (cardIndex === -1) {
    throw new Error(`Card with instanceId ${instanceId} not found in ${from} zone`);
  }

  const card = sourceZone[cardIndex];
  const updatedCard: CardInstance = {
    ...card,
    ...updates,
    location: to, // location は常に上書き
  };

  return {
    ...currentZones,
    [from]: [...sourceZone.slice(0, cardIndex), ...sourceZone.slice(cardIndex + 1)],
    [to]: [...currentZones[to], updatedCard],
  };
}

/** 指定カードの表示形式を変更する*/
export function updateCardInPlace(currentZones: Zones, instanceId: string, updates: Partial<CardInstance>): Zones {
  // 全ゾーンからカードを検索
  for (const zoneName of Object.keys(currentZones) as (keyof Zones)[]) {
    const zone = currentZones[zoneName];
    const cardIndex = zone.findIndex((card) => card.instanceId === instanceId);

    if (cardIndex !== -1) {
      // カードが見つかった場合、そのゾーン内で更新
      return {
        ...currentZones,
        [zoneName]: zone.map((card) => (card.instanceId === instanceId ? { ...card, ...updates } : card)),
      };
    }
  }

  throw new Error(`Card with instanceId ${instanceId} not found in any zone`);
}

/** 指定枚数のカードをデッキから手札に移動する */
export function drawCards(currentZones: Zones, count: number = 1): Zones {
  if (currentZones.deck.length < count) {
    throw new Error(`Cannot draw ${count} cards. Only ${currentZones.deck.length} cards remaining in deck.`);
  }

  let updatedZones = currentZones;

  for (let i = 0; i < count; i++) {
    const topCard = updatedZones.deck[updatedZones.deck.length - 1];
    updatedZones = moveCard(updatedZones, topCard.instanceId, "deck", "hand");
  }

  return updatedZones;
}

/** 指定カードを墓地に移動する */
export function sendToGraveyard(currentZones: Zones, instanceId: string): Zones {
  const card = [
    ...currentZones.mainMonsterZone,
    ...currentZones.spellTrapZone,
    ...currentZones.fieldZone,
    ...currentZones.hand,
  ].find((c) => c.instanceId === instanceId);

  if (!card) {
    throw new Error(
      `Card with instanceId ${instanceId} not found in mainMonsterZone, spellTrapZone, fieldZone, or hand`,
    );
  }

  const sourceZone = card.location as keyof Zones;
  return moveCard(currentZones, instanceId, sourceZone, "graveyard");
}

/** 指定複数枚のカードを手札から墓地に移動する */
export function discardCards(currentZones: Zones, instanceIds: string[]): Zones {
  // カードが手札に存在することを確認する
  for (const instanceId of instanceIds) {
    const cardInHand = currentZones.hand.find((c) => c.instanceId === instanceId);
    if (!cardInHand) {
      throw new Error(`Card with instanceId ${instanceId} not found in hand`);
    }
  }

  // カードを1枚ずつ墓地に移動する
  let updatedZones = currentZones;
  for (const instanceId of instanceIds) {
    updatedZones = moveCard(updatedZones, instanceId, "hand", "graveyard");
  }

  return updatedZones;
}

/** 指定カードを除外する */
export function banishCard(currentZones: Zones, instanceId: string, from: keyof Zones): Zones {
  return moveCard(currentZones, instanceId, from, "banished");
}

/** デッキをシャッフルする */
export function shuffleDeck(zones: Zones): Zones {
  return {
    ...zones,
    deck: shuffleArray(zones.deck),
  };
}

/** ゾーン内のカード枚数 */
export const countZone = (zones: Zones, zone: keyof Zones): number => {
  return zones[zone].length;
};

/** 手札のカード枚数（発動元が手札にある場合は除外） */
export const countHandExcludingSelf = (zones: Zones, sourceInstance: CardInstance): number => {
  return sourceInstance.location === "hand"
    ? zones.hand.filter((c) => c.instanceId !== sourceInstance.instanceId).length
    : zones.hand.length;
};

/** デッキが空かどうか */
export const isDeckEmpty = (zones: Zones): boolean => {
  return zones.deck.length === 0;
};

/** メインモンスターゾーンが最大枚数に達しているかどうか */
export const isMainMonsterZoneFull = (zones: Zones, maxMainMonsterZoneSize: number = 5): boolean => {
  return zones.mainMonsterZone.length >= maxMainMonsterZoneSize;
};

/** 魔法・罠ゾーンが最大枚数に達しているかどうか */
export const isSpellTrapZoneFull = (zones: Zones, maxSpellTrapZoneSize: number = 5): boolean => {
  return zones.spellTrapZone.length >= maxSpellTrapZoneSize;
};

/** フィールドゾーンが最大枚数に達しているかどうか */
export const isFieldZoneFull = (zones: Zones, maxFieldZoneSize: number = 1): boolean => {
  return zones.fieldZone.length >= maxFieldZoneSize;
};
