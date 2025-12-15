import { writable, get } from "svelte/store";
import { browser } from "$app/environment";

interface ThemeLabel {
  name: string;
  emoji: string;
}

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

export const themeStore = writable<Theme>(savedTheme);

export function getTheme(): Theme {
  return get(themeStore);
}

export function setTheme(theme: Theme): void {
  themeStore.set(theme);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("theme", JSON.stringify(theme));
  }

  applyTheme();
}

export function applyTheme(): void {
  const theme = getTheme();
  if (browser) {
    document.documentElement.setAttribute("data-theme", theme.name);
    document.documentElement.setAttribute("data-mode", theme.dark ? "dark" : "light");
  }
}
