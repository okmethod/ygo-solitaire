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
  CardType,
  MonsterType,
  ExtraMonsterSubType,
  MagicSubType,
  TrapSubType,
  CardImages,
  MonsterAttributes,
  CardDisplayData,
} from "$lib/application/types/card";

/**
 * Card type alias for CardDisplayData
 *
 * CardDisplayDataのエイリアス。既存コードとの互換性のために提供。
 *
 * Note: 旧Card型が持っていたUI状態（instanceId, isSelected, position）は
 * コンポーネントのローカルstateで管理してください。
 */
export type { CardDisplayData as Card } from "$lib/application/types/card";
