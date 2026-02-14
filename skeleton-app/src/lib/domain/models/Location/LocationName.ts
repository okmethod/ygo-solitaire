/**
 * LocationName - ゲーム中にカードが配置される領域
 *
 * フィールドだけでなく手札も含むため、Zone ではなく Location と命名している。
 *
 * 使用例:
 * - カード1枚（CardInstance）の所在を示す Location プロパティ
 * - ゲーム内のカード空間（CardSpace）が管理する各種 Location マップ
 */

export const FIELD_LOCATIONS = ["mainMonsterZone", "spellTrapZone", "fieldZone"] as const;
export type FieldLocationName = (typeof FIELD_LOCATIONS)[number];

export const DECK_LOCATIONS = ["mainDeck", "extraDeck"] as const;
export type DeckLocationName = (typeof DECK_LOCATIONS)[number];

export const OTHER_LOCATIONS = ["hand", "graveyard", "banished"] as const;
export type OtherLocationName = (typeof OTHER_LOCATIONS)[number];

/** 全ロケーション名 */
export type LocationName = FieldLocationName | DeckLocationName | OtherLocationName;

/** 指定ロケーションがフィールドかどうか */
export const isFieldLocation = (locationName: LocationName): boolean => {
  return (FIELD_LOCATIONS as readonly string[]).includes(locationName);
};

/** 指定ロケーションがデッキかどうか */
export const isDeckLocation = (locationName: LocationName): boolean => {
  return (DECK_LOCATIONS as readonly string[]).includes(locationName);
};

/** 指定ロケーションが手札かどうか */
export const isHandLocation = (locationName: LocationName): boolean => {
  return locationName === "hand";
};

/** 指定ロケーションが墓地かどうか */
export const isGraveyardLocation = (locationName: LocationName): boolean => {
  return locationName === "graveyard";
};

/** 指定ロケーションが除外ゾーンかどうか */
export const isBanishedLocation = (locationName: LocationName): boolean => {
  return locationName === "banished";
};
