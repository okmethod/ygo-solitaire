import type { FrameSubType } from "$lib/presentation/types";

/**
 * フレームタイプ別の背景色クラス
 *
 * 遊戯王カードのフレーム色に基づいた配色:
 * - normal（通常モンスター）: 黄色
 * - effect（効果モンスター）: オレンジ
 * - ritual（儀式モンスター）: 青
 * - pendulum（ペンデュラムモンスター）: ティール
 * - fusion（融合モンスター）: 青紫
 * - synchro（シンクロモンスター）: 白
 * - xyz（エクシーズモンスター）: 黒
 * - link（リンクモンスター）: 濃い青
 * - spell（魔法カード）: 緑
 * - trap（罠カード）: 赤紫
 */
const FRAME_TYPE_BACKGROUND_CLASSES: Record<FrameSubType, string> = {
  // light: yellow-200 #FEF08A / dark: yellow-700 #A16207
  normal: "!bg-yellow-200 dark:!bg-yellow-700",

  // light: orange-200 #FED7AA / dark: orange-800 #9A3412
  effect: "!bg-orange-200 dark:!bg-orange-800",

  // light: blue-200 #BFDBFE / dark: blue-800 #1E40AF
  ritual: "!bg-blue-200 dark:!bg-blue-800",

  // light: teal-200 #99F6E4 / dark: teal-800 #115E59
  pendulum: "!bg-teal-200 dark:!bg-teal-800",

  // light: violet-200 #DDD6FE / dark: violet-800 #5B21B6
  fusion: "!bg-violet-200 dark:!bg-violet-800",

  // light: gray-100 #F3F4F6 / dark: gray-600 #4B5563
  synchro: "!bg-gray-100 dark:!bg-gray-600",

  // light: gray-700 #374151 / dark: gray-900 #111827
  xyz: "!bg-gray-700 dark:!bg-gray-900",

  // light: blue-400 #60A5FA / dark: blue-900 #1E3A8A
  link: "!bg-blue-400 dark:!bg-blue-900",

  // light: green-200 #BBF7D0 / dark: green-800 #166534
  spell: "!bg-green-200 dark:!bg-green-800",

  // light: purple-200 #E9D5FF / dark: purple-800 #6B21A8
  trap: "!bg-purple-200 dark:!bg-purple-800",
} as const;

/** フレームタイプに応じた背景色クラスを取得する */
export function getFrameBackgroundClass(
  frameType?: FrameSubType,
  fallback: string = "bg-surface-100-600-token",
): string {
  if (!frameType) return fallback;
  return FRAME_TYPE_BACKGROUND_CLASSES[frameType] || fallback;
}
