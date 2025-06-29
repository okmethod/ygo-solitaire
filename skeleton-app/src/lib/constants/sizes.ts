/**
 * コンポーネント共通のサイズ定義
 */

export type ComponentSize = "small" | "medium" | "large";

/**
 * カードコンポーネント用のサイズクラス
 * Card、Graveyard等のカード関連コンポーネントで使用
 */
export const CARD_SIZE_CLASSES: Record<ComponentSize, string> = {
  small: "w-16 h-24",
  medium: "w-22 h-32",
  large: "w-32 h-48",
};

/**
 * バッジコンポーネント用のサイズクラス
 * CountBadge等の小さなUIコンポーネントで使用
 */
export const BADGE_SIZE_CLASSES: Record<ComponentSize, string> = {
  small: "w-4 h-4 text-xs",
  medium: "w-6 h-6 text-xs",
  large: "w-8 h-8 text-sm",
};
