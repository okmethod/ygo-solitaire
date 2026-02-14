/**
 * Zone - 領域モデル
 *
 * ゲーム中にカードが配置される領域を表現するモデル。
 * プレーンなオブジェクトとして実装し、クラス化しない。
 * （理由: GameState に内包されるため）
 *
 * 領域間でのカード移動や状態管理のためのユーティリティ関数も提供する。
 *
 * @module domain/models/Zone
 * @see {@link docs/domain/overview.md}
 */

import type { CardInstance, StateOnField } from "$lib/domain/models/CardOld";
import { updatedCardInstance, createInitialStateOnField } from "$lib/domain/models/CardOld";
import { shuffleArray } from "$lib/shared/utils/arrayUtils";

/** フィールドゾーン名の配列 */
const FIELD_ZONES: readonly ZoneName[] = ["mainMonsterZone", "spellTrapZone", "fieldZone"] as const;

/** 指定ゾーンがフィールドかどうか */
export const isFieldZone = (zoneName: ZoneName): boolean => {
  return FIELD_ZONES.includes(zoneName);
};

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

/** インスタンスIDからカードインスタンスを検索する */
export function findCardInstance(zones: Zones, instanceId: string) {
  const allZones = [
    ...zones.deck,
    ...zones.hand,
    ...zones.mainMonsterZone,
    ...zones.spellTrapZone,
    ...zones.fieldZone,
    ...zones.graveyard,
    ...zones.banished,
  ];

  return allZones.find((card) => card.instanceId === instanceId);
}

/**
 * カードの移動および表示形式を変更を行う（汎用）
 *
 * フィールドへの移動時: stateOnField が未設定なら初期化
 * フィールドから離脱時: stateOnField をクリア
 */
export function moveCard(
  currentZones: Zones,
  card: CardInstance,
  to: ZoneName,
  updates?: Partial<CardInstance> & { stateOnField?: StateOnField },
): Zones {
  const from = card.location;
  const sourceZone = currentZones[from];
  const cardIndex = sourceZone.findIndex((c) => c.instanceId === card.instanceId);

  // stateOnField の処理
  let stateOnField: StateOnField | undefined = updates?.stateOnField ?? card.stateOnField;

  if (isFieldZone(to) && !isFieldZone(from)) {
    // フィールドへ移動: stateOnField を初期化（updates で指定されていなければ）
    stateOnField = stateOnField ?? createInitialStateOnField();
  } else if (!isFieldZone(to) && isFieldZone(from)) {
    // フィールドから離脱: stateOnField をクリア
    stateOnField = undefined;
  }

  const updatedCard: CardInstance = {
    ...card,
    ...updates,
    location: to,
    stateOnField,
  };

  return {
    ...currentZones,
    [from]: [...sourceZone.slice(0, cardIndex), ...sourceZone.slice(cardIndex + 1)],
    [to]: [...currentZones[to], updatedCard],
  };
}

/** 指定カードの表示形式を変更する（カードの位置は変わらない）*/
export function updateCardInPlace(currentZones: Zones, card: CardInstance, updates: Partial<CardInstance>): Zones {
  const zoneName = card.location;
  const zone = currentZones[zoneName];

  return {
    ...currentZones,
    [zoneName]: zone.map((c) => (c.instanceId === card.instanceId ? updatedCardInstance(c, updates) : c)),
  };
}

/** 指定枚数のカードをデッキから手札に移動する */
export function drawCards(currentZones: Zones, count: number = 1): Zones {
  if (currentZones.deck.length < count) {
    throw new Error(`Cannot draw ${count} cards. Only ${currentZones.deck.length} cards remaining in deck.`);
  }

  let updatedZones = currentZones;

  for (let i = 0; i < count; i++) {
    const topCard = updatedZones.deck[updatedZones.deck.length - 1];
    updatedZones = moveCard(updatedZones, topCard, "hand");
  }

  return updatedZones;
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
