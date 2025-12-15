/**
 * Application Layer: Card Data Transfer Objects (DTOs)
 *
 * Application層が定義するカードデータの契約。
 * Port/Adapterパターンにおいて、Application層とInfrastructure層の境界で使用される。
 *
 * @module application/types/card
 */

export type CardType = "monster" | "spell" | "trap";

export type MonsterType = "normal" | "effect";
// チューナー, デュアル, リバース などは後回しにする
export type ExtraMonsterSubType = "fusion" | "synchro" | "xyz" | "pendulum" | "link";
export type MagicSubType = "normal" | "effect" | "ritual" | "quick-play" | "field" | "equip";
export type TrapSubType = "normal" | "continuous" | "counter";

/**
 * カード画像データ
 * YGOPRODeck APIから取得されるカード画像URL情報
 */
export interface CardImages {
  image: string; // メイン画像URL
  imageSmall: string; // サムネイル画像URL
  imageCropped: string; // クロップ画像URL
}

/**
 * モンスターカード属性情報
 * YGOPRODeck APIから取得されるモンスターカード固有のデータ
 */
export interface MonsterAttributes {
  attack: number;
  defense: number;
  level: number;
  attribute: string; // DARK, LIGHT, EARTH, etc.
  race: string; // Spellcaster, Dragon, etc.
}

/**
 * Application層のDTO: UI表示用カードデータ
 *
 * YGOPRODeck APIから取得されたカード情報をUIコンポーネントで表示するための型。
 * Application層のPort（ICardDataRepository）がこの型を契約として使用する。
 *
 * **Design Decision**:
 * - この型はApplication層のデータ契約（DTO）であり、Presentation層の型ではない
 * - Infrastructure層（Adapter）がこの型のデータを生成する
 * - Presentation層は型エイリアスを通じてこの型を参照する（後方互換性）
 */
export interface CardDisplayData {
  // 必須プロパティ
  id: number; // YGOPRODeck API uses numeric IDs
  name: string;
  type: CardType;
  description: string; // カード効果テキスト

  // オプショナルなAPIプロパティ
  frameType?: string; // "normal", "effect", "xyz", etc.
  archetype?: string; // アーキタイプ名（例: "Blue-Eyes"）

  // モンスターカード専用プロパティ（存在する場合のみ）
  monsterAttributes?: MonsterAttributes;

  // 画像プロパティ（存在する場合のみ）
  images?: CardImages;
}
