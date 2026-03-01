/**
 * ChainableAction Effect Library - 発動する効果ライブラリ
 *
 * @module domain/effects/actions
 */

import { ChainableActionRegistry } from "$lib/domain/effects/actions/ChainableActionRegistry";
export { ChainableActionRegistry };

// ===========================
// DSL未対応カードのフォールバック
// ===========================

/** DSL未対応カードの定義マップ */
const chainableActionRegistrations = new Map<number, () => void>([]);

/** DSL未対応カード定義マップから ChainableAction を登録する*/
export function registerChainableActionFromMap(cardId: number): void {
  const register = chainableActionRegistrations.get(cardId);
  if (register) {
    register();
  }
}
