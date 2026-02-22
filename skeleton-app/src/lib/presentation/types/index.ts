/**
 * プレゼン層 の型エイリアス群
 *
 * アプリ層のDTOを再エクスポートし、プレゼン層のコンポーネントに提供する。
 * 型定義の実体はアプリ層にあり、プレゼン層は型エイリアスのみを持つ。
 *
 * @module presentation/types
 */

export type { GameSnapshot, InteractionConfig } from "$lib/application/types/game";

export type {
  CardInstance,
  CardType,
  FrameSubType,
  MainMonsterSubType,
  ExtraMonsterSubType,
  SpellSubType,
  TrapSubType,
  CardImages,
  MonsterAttributes,
  DisplayCardData,
  CardInstanceOnFieldRef,
} from "$lib/application/types/card";

export type {
  RecipeCardEntry,
  LoadedCardEntry,
  DeckStats,
  DeckRecipe,
  MainDeckData,
  ExtraDeckData,
  DeckData,
} from "$lib/application/types/deck";

export { ZONE_CAPACITY } from "$lib/application/types/card";

export type { DisplayCardInstance, DisplayCardInstanceOnField, DisplayCardInstanceAggregated } from "./card";
export type { ConfirmationModalConfig, CardSelectionModalConfig, ChainConfirmationModalConfig } from "./interaction";
