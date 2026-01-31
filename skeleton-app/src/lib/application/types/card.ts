/**
 * card - カードデータの DTO (Data Transfer Object)
 *
 * Application 層と Infrastructure 層の境界で使用される。
 * Port/Adapter パターンにおける契約 (Contract)。
 *
 * IMPORTANT REMINDER: Application Layer - レイヤー間依存ルール
 * - Application Layer は Domain Layer に依存できる
 * - Infrastructure Layer は Application Layer に依存できる
 * - Infrastructure Layer は Domain Layer に直接依存してはいけない
 *
 * @module application/types/card
 */

import type {
  CardInstance,
  CardType,
  FrameSubType,
  MainMonsterSubType,
  ExtraMonsterSubType,
  SpellSubType,
  TrapSubType,
} from "$lib/domain/models/Card";

/**
 * Domain 型の再エクスポート（Port/Adapter 境界での標準パターン）
 *
 * Infrastructure 層が Domain 層に直接依存するのを防ぐため、Application 層で再エクスポートする。
 */
export type {
  CardInstance,
  CardType,
  FrameSubType,
  MainMonsterSubType,
  ExtraMonsterSubType,
  SpellSubType,
  TrapSubType,
};

/** モンスターカード属性情報 (YGOPRODeck API) */
export interface MonsterAttributes {
  attack: number;
  defense: number;
  level: number;
  attribute: string; // DARK, LIGHT, EARTH, etc.
  race: string; // Spellcaster, Dragon, etc.
}

/** カード画像 URL 情報 (YGOPRODeck API) */
export interface CardImages {
  image: string; // メイン画像URL
  imageSmall: string; // サムネイル画像URL
  imageCropped: string; // クロップ画像URL
}

/**
 * UI 表示用カードデータ (DTO)
 *
 * CardDisplayDataFactory によって生成される。
 * - CardData (Domain層): ゲームロジックの根拠
 * - ExternalCardData (API経由): 表示用および検証用
 *
 * @see CardDisplayDataFactory
 */
export interface CardDisplayData {
  id: number;
  name: string; // 英語版カード名
  jaName: string; // 日本語版カード名
  type: CardType;
  frameType: FrameSubType;
  description: string; // カードテキスト
  archetype?: string; // アーキタイプ（テーマ名）
  monsterAttributes?: MonsterAttributes;
  images?: CardImages;
}
