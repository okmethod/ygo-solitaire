/**
 * themeStore - カラーテーマとライト/ダークモードの状態管理ストア
 *
 * 選択中のテーマ名とダークモードフラグを localStorage に永続化し、
 * ページ再訪時に前回の設定を復元する。
 * DOM への反映（data-theme / data-mode 属性）は applyTheme() に集約する。
 */

import { writable, get } from "svelte/store";
import { browser } from "$app/environment";

interface ThemeLabel {
  name: string;
  emoji: string;
}

/** 選択可能なテーマの表示名と絵文字の対応リスト */
export const themeLabels: Array<ThemeLabel> = [
  { name: "catppuccin", emoji: "🐈" },
  { name: "cerberus", emoji: "🐺" },
  { name: "concord", emoji: "🤖" },
  { name: "crimson", emoji: "🔴" },
  { name: "fennec", emoji: "🦊" },
  { name: "hamlindigo", emoji: "👔" },
  { name: "legacy", emoji: "💀" },
  { name: "mint", emoji: "🍃" },
  { name: "modern", emoji: "🌸" },
  { name: "mona", emoji: "🐙" },
  { name: "nosh", emoji: "🥙" },
  { name: "nouveau", emoji: "👑" },
  { name: "pine", emoji: "🌲" },
  { name: "reign", emoji: "📒" },
  { name: "rocket", emoji: "🚀" },
  { name: "rose", emoji: "🌷" },
  { name: "sahara", emoji: "🏜️" },
  { name: "seafoam", emoji: "🧜‍♀️" },
  { name: "terminus", emoji: "🌑" },
  { name: "vintage", emoji: "📺" },
  { name: "vox", emoji: "👾" },
  { name: "wintry", emoji: "🌨️" },
  { name: "custom", emoji: "🎨" },
] as const;

/** themeLabels に定義されたテーマ名の Union 型 */
export type ThemeName = (typeof themeLabels)[number]["name"];

interface Theme {
  name: ThemeName;
  dark: boolean;
}

const defaultTheme: Theme = { name: themeLabels[0]["name"], dark: false };
const savedTheme: Theme =
  typeof localStorage !== "undefined"
    ? JSON.parse(localStorage.getItem("theme") || JSON.stringify(defaultTheme))
    : defaultTheme;

/** 現在適用中のテーマ状態。localStorage の値で初期化される */
export const themeStore = writable<Theme>(savedTheme);

/** 現在のテーマ状態を返す */
export function getTheme(): Theme {
  return get(themeStore);
}

/** テーマを更新し localStorage に永続化する。DOM への反映も行う */
export function setTheme(theme: Theme): void {
  themeStore.set(theme);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("theme", JSON.stringify(theme));
  }

  applyTheme();
}

/** data-theme / data-mode 属性を DOM に反映する */
export function applyTheme(): void {
  const theme = getTheme();
  if (browser) {
    document.documentElement.setAttribute("data-theme", theme.name);
    document.documentElement.setAttribute("data-mode", theme.dark ? "dark" : "light");
  }
}
