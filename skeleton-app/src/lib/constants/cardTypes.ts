import type { CardType } from "$lib/types/card";

/**
 * カードタイプ別の背景色クラス
 */
export const CARD_TYPE_BACKGROUND_CLASSES: Record<CardType, string> = {
  monster: "!bg-yellow-200 dark:!bg-yellow-800",
  spell: "!bg-green-200 dark:!bg-green-800",
  trap: "!bg-purple-200 dark:!bg-purple-800",
} as const;

/**
 * カードタイプに応じた背景色クラスを取得する
 */
export function getCardTypeBackgroundClass(cardType?: CardType, fallback: string = "bg-surface-100-600-token"): string {
  if (!cardType) return fallback;
  return CARD_TYPE_BACKGROUND_CLASSES[cardType] || fallback;
}
