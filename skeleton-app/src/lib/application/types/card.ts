/**
 * card - カードデータの DTO (Data Transfer Object)
 *
 * @architecture レイヤー間依存ルール - アプリ層 (DTO)
 * - ROLE: アプリ層やプレゼン層が消費するデータ形式の定義
 * - ALLOWED: ドメイン層のモデルへの依存
 * - FORBIDDEN: インフラ層への依存、プレゼン層への依存
 *
 * @module application/types/card
 */

import type { CardType, FrameSubType } from "$lib/domain/models/Card";

/** モンスターカード属性情報 */
export interface MonsterAttributes {
  attack: number;
  defense: number;
  level: number;
  attribute: string; // DARK, LIGHT, EARTH, etc.
  race: string; // Spellcaster, Dragon, etc.
}

/** カード画像 URL 情報 */
export interface CardImages {
  image: string; // メイン画像URL
  imageSmall: string; // サムネイル画像URL
  imageCropped: string; // クロップ画像URL
}

/**
 * UI 表示用カードデータ (DTO)
 *
 * displayDataFactory によって生成される。
 * - CardData (ドメイン層): ゲームロジックの根拠
 * - ExternalCardData (API経由): 表示用および検証用
 *
 * @see displayDataFactory
 */
export interface DisplayCardData {
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

/**
 * CardInstance への参照 (DTO)
 *
 * カードインスタンスを参照するための基底型。
 * フィールド外（手札・墓地・除外など）ではこの型をそのまま使用する。
 */
export interface CardInstanceRef {
  cardId: number; // DisplayCardData を参照するためのカードID
  instanceId: string;
}

/**
 * フィールド上のカードの状態 (DTO)
 *
 * CardInstanceRef を継承し、フィールド上の状態（position, battlePosition, counters）を追加。
 * derivedStores で生成され、プレゼン層はこの型を通じてフィールド上のカード状態にアクセスする。
 */
export interface CardInstanceOnFieldRef extends CardInstanceRef {
  position: "faceUp" | "faceDown";
  battlePosition?: "attack" | "defense";
  counters: readonly { type: string; count: number }[];
}

/**
 * ドメイン層の型の再エクスポート（Port/Adapter 境界での標準パターン）
 *
 * インフラ層がドメイン層に直接依存するのを防ぐため、アプリ層で再エクスポートする。
 */
export type {
  CardData,
  CardInstance,
  CardType,
  FrameSubType,
  MainMonsterSubType,
  ExtraMonsterSubType,
  SpellSubType,
  TrapSubType,
} from "$lib/domain/models/Card";

/** 固定値の再エクスポート */
export { ZONE_CAPACITY } from "$lib/domain/models/GameState/CardSpace";
