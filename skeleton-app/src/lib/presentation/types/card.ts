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
  card: CardDisplayData | null;
  instanceId: string;
}

/**
 * フィールド上のカード表示情報
 *
 * CardDisplayData とフィールド上の表示状態をマージした、
 * UIコンポーネントが直接使用する表示用データ。
 */
export interface FieldCardDisplayInfo {
  card: CardDisplayData;
  instanceId: string;
  faceDown: boolean;
  rotation?: number; // カードの向き（守備表示等）
  spellCounterCount?: number; // 魔力カウンター数（全ゾーン共通）
}
