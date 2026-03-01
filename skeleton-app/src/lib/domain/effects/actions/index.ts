/**
 * ChainableAction Effect Library - 発動する効果ライブラリ
 *
 * 登録方式:
 * - DSLベース: YAML定義からloaderを使って登録（優先）
 * - クラスベース: 個別のActivationクラスをインポートして登録
 *
 * @module domain/effects/actions
 */

import { ChainableActionRegistry } from "$lib/domain/effects/actions/ChainableActionRegistry";
import { loadCardFromYaml } from "$lib/domain/dsl/loader";
import { dslDefinitions } from "$lib/domain/cards/definitions";
export { ChainableActionRegistry };

// ===========================
// 定義マップ（DSL未対応カードのみ）
// ===========================

const chainableActionRegistrations = new Map<number, () => void>([]);

// ===========================
// 登録関数
// ===========================

/**
 * レジストリをクリアし、指定されたカードIDの ChainableAction を登録する
 *
 * DSL定義、またはクラス定義マップから登録する。
 */
export function registerChainableActionsByIds(cardIds: number[]): void {
  ChainableActionRegistry.clear();

  for (const cardId of cardIds) {
    // DSL定義があれば登録（優先）
    const yamlContent = dslDefinitions.get(cardId);
    if (yamlContent) {
      loadCardFromYaml(yamlContent);
      continue;
    }

    // なければクラス定義マップから登録
    const register = chainableActionRegistrations.get(cardId);
    if (register) {
      register();
    }
  }
}
