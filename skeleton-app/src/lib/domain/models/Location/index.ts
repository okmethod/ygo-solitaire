/**
 * Location モデル
 *
 * これらはプレーンなオブジェクトとして実装し、クラス化しない。
 * （理由: 不変性担保 / Svelte 5 Runes での変更追跡性 / シリアライズ可能）
 *
 * 代わりに名前空間としてエクスポートし、純粋関数をクラスライクに利用できるようにする。
 *
 * @module domain/models/Location
 * @see {@link docs/domain/overview.md}
 */

export type { LocationName, FieldLocationName, DeckLocationName, OtherLocationName } from "./LocationName";

import * as LocationsNameFuncs from "./LocationName";

/* Location 名前空間
 *
 * ロケーションに関する純粋関数（ロジック）を階層的に集約する。
 */
export const Location = {
  names: [
    ...LocationsNameFuncs.FIELD_LOCATIONS,
    ...LocationsNameFuncs.DECK_LOCATIONS,
    ...LocationsNameFuncs.OTHER_LOCATIONS,
  ],
  isField: LocationsNameFuncs.isFieldLocation,
  isDeck: LocationsNameFuncs.isDeckLocation,
  isHand: LocationsNameFuncs.isHandLocation,
  isGraveyard: LocationsNameFuncs.isGraveyardLocation,
  isBanished: LocationsNameFuncs.isBanishedLocation,
} as const;
