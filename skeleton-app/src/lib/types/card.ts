export type CardType = "monster" | "spell" | "trap";

export type MonsterType = "normal" | "effect";
// チューナー, デュアル, リバース などは後回しにする
export type ExtraMonsterSubType = "fusion" | "synchro" | "xyz" | "pendulum" | "link";
export type MagicSubType = "normal" | "effect" | "ritual" | "quick-play" | "field" | "equip";
export type TrapSubType = "normal" | "continuous" | "counter";

interface MonsterCardProperties {
  attack?: number;
  defense?: number;
  level?: number;
  attribute?: string;
  race?: string;
}

interface CardImageProperties {
  image?: string; // URL to card image
  imageSmall?: string; // URL to small card image
  imageCropped?: string; // URL to cropped card image
}

/**
 * カード画像データ（T038）
 * YGOPRODeck APIから取得されるカード画像URL情報
 */
export interface CardImages {
  image: string; // メイン画像URL
  imageSmall: string; // サムネイル画像URL
  imageCropped: string; // クロップ画像URL
}

/**
 * モンスターカード属性情報（T039）
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
 * UI表示用カードデータ（T037）
 * YGOPRODeck APIから取得されたカード情報をUIコンポーネントで表示するための型
 * CardDataを置き換える新しいPresentation Layer型定義
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

/**
 * 静的なカードマスターデータ（Presentation Layer用）
 * YGOPRODeck APIから取得される不変のカード情報を表現
 * UIコンポーネントやデッキレシピで使用
 */
export interface CardData {
  // 必須プロパティ
  id: number; // YGOPRODeck API uses numeric IDs
  name: string;
  type: CardType;
  description: string; // API always provides description

  // オプショナルなAPIプロパティ
  frameType?: string; // API provides frameType like "normal", "effect", etc.
  archetype?: string; // API provides archetype information

  // モンスターカード専用プロパティ
  monster?: MonsterCardProperties;

  // 画像プロパティ
  images?: CardImageProperties;
}

/**
 * ゲーム内で使用する動的なカードインスタンス（Presentation Layer用）
 * CardDataにゲーム状態（選択状態、フィールド上の位置など）を追加
 * 実際のデュエル中にのみ使用
 *
 * @deprecated Use CardDisplayData for new code (T040)
 */
export interface Card extends CardData {
  instanceId?: string; // 同じカードの複数インスタンスを区別するための一意ID
  isSelected?: boolean; // UI上での選択状態
  position?: "attack" | "defense" | "facedown"; // フィールド上での表示形式
}
