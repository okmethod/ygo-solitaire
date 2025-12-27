/**
 * Application Layer: Card Data Transfer Objects (DTOs)
 *
 * Application層が定義するカードデータの契約。
 * Port/Adapterパターンにおいて、Application層とInfrastructure層の境界で使用される。
 *
 * @module application/types/card
 */

import type {
  CardType,
  MainMonsterSubType,
  ExtraMonsterSubType,
  SpellSubType,
  TrapSubType,
} from "$lib/domain/models/Card";

/**
 * Domain型の再エクスポート（Clean Architecture準拠）
 *
 * **なぜ再エクスポートするのか？**
 * - Infrastructure層がDomain層に直接依存するのを防ぐため
 * - Clean Architectureの依存関係ルール: Infrastructure → Application → Domain
 * - Port/Adapter境界でDomain型を使用する場合、Application層で再エクスポートするのが一般的なパターン
 *
 * **依存関係の流れ**:
 * 1. Domain層で型を定義（CardType等）
 * 2. Application層で再エクスポート（このファイル）
 * 3. Infrastructure層はApplication層からimport（Domain層に直接依存しない）
 *
 * @example
 * ```typescript
 * // ❌ Infrastructure層がDomain層に直接依存（Clean Architecture違反）
 * import type { CardType } from "$lib/domain/models/Card";
 *
 * // ✅ Infrastructure層がApplication層を経由（Clean Architecture準拠）
 * import type { CardType } from "$lib/application/types/card";
 * ```
 */
export type { CardType, MainMonsterSubType, ExtraMonsterSubType, SpellSubType, TrapSubType };

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
 *
 * **Type Dependencies**:
 * - CardType等のDomain型は、このファイルで再エクスポートされたものを使用してください
 * - Infrastructure層は domain/models/Card から直接 import してはいけません（Clean Architecture違反）
 */
export interface CardDisplayData {
  // 必須プロパティ
  id: number; // YGOPRODeck API uses numeric IDs
  name: string;
  type: CardType; // Re-exported from domain/models/Card
  description: string; // カード効果テキスト

  // オプショナルなAPIプロパティ
  frameType?: string; // "normal", "effect", "xyz", etc.
  archetype?: string; // アーキタイプ名（例: "Blue-Eyes"）

  // モンスターカード専用プロパティ（存在する場合のみ）
  monsterAttributes?: MonsterAttributes;

  // 画像プロパティ（存在する場合のみ）
  images?: CardImages;
}
