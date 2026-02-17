/**
 * 表示用のカード型定義
 *
 * Application層の型を再エクスポートし、Presentation層固有の型エイリアスを提供。
 *
 * @module presentation/types/card
 */

import type { CardDisplayData } from "$lib/application/types/card";

/**
 * カード表示情報（インスタンス識別付き）
 *
 * 手札、墓地、エクストラデッキなど、
 * フィールド外のゾーンで使用する汎用型。
 */
export interface CardInstanceDisplayInfo {
  card: CardDisplayData;
  instanceId: string;
}

/**
 * フィールド上のカード表示情報
 *
 * CardInstanceDisplayInfo にフィールド固有の表示状態を追加した、
 * UIコンポーネントが直接使用する表示用データ。
 */
export interface FieldCardDisplayInfo extends CardInstanceDisplayInfo {
  faceDown: boolean;
  rotation?: number; // カードの向き（守備表示等）
  spellCounterCount?: number; // 魔力カウンター数（全ゾーン共通）
}

/**
 * 集約表示用カード情報
 *
 * 同名カードをまとめて枚数表示する際に使用。
 */
export interface AggregatedCard extends CardInstanceDisplayInfo {
  quantity: number;
}
