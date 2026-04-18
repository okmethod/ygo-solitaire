import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import type { AppTypes } from "$app/types";

type GotoOptions = Parameters<typeof goto>[1];

/** アプリ内の有効なパス名（SvelteKitのルートから自動生成） */
export type AppPathname = ReturnType<AppTypes["Pathname"]>;

/** base path を考慮したナビゲーション */
export function navigateTo(path: AppPathname, options?: GotoOptions): Promise<void> {
  return goto(resolve(path), options);
}
