/**
 * Presentation Layer の型エイリアス群
 *
 * Application層のDTOを再エクスポートし、Presentation層のコンポーネントに提供する。
 * 型定義の実体はApplication層にあり、Presentation層は型エイリアスのみを持つ。
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
  CardDisplayData,
  CardDisplayStateOnField,
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

export type { CardInstanceDisplayInfo, FieldCardDisplayInfo, AggregatedCard } from "./card";
export type { ConfirmationModalConfig, CardSelectionModalConfig } from "./interaction";
