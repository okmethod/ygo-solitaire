import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import type { PathnameWithSearchOrHash } from "$app/types";

type GotoOptions = Parameters<typeof goto>[1];

/** アプリ内の有効なパス名（base path 相対、SvelteKit のルートから自動生成） */
export type AppPathname = PathnameWithSearchOrHash;

/** base path を考慮したナビゲーション */
export function navigateTo(path: AppPathname, options?: GotoOptions): Promise<void> {
  return goto(resolve(path), options);
}
