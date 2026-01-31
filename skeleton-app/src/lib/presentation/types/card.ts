/**
 * Presentation Layer: Card Type Aliases
 *
 * Application層のDTOを再エクスポートし、Presentation層のコンポーネントに提供。
 * 型定義の実体はApplication層にあり、Presentation層は型エイリアスのみを持つ。
 *
 * **Backward Compatibility**: 既存のコンポーネントがimport pathを変更せずに動作するための互換層。
 *
 * @module presentation/types/card
 */

// Application層のDTOを再エクスポート
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
} from "$lib/application/types/card";
