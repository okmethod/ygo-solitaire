/**
 * AdditionalRule Effect Library - 適用する効果ライブラリ
 *
 * 登録方式:
 * - DSLベース: YAML定義からloaderを使って登録（優先）
 * - クラスベース: 個別のRuleクラスをインポートして登録
 *
 * @module domain/effects/rules
 */

import { AdditionalRuleRegistry } from "$lib/domain/effects/rules/AdditionalRuleRegistry";
import { loadCardFromYaml } from "$lib/domain/dsl/loader";
import { dslDefinitions } from "$lib/domain/cards/definitions";
export { AdditionalRuleRegistry };

// ===========================
// 定義マップ（DSL未対応カードのみ）
// ===========================

const additionalRuleRegistrations = new Map<number, () => void>([]);

// ===========================
// 登録関数
// ===========================

/**
 * レジストリをクリアし、指定されたカードIDの AdditionalRule を登録する
 *
 * DSL定義、またはクラス定義マップから登録する。
 */
export function registerAdditionalRulesByIds(cardIds: number[]): void {
  AdditionalRuleRegistry.clear();

  for (const cardId of cardIds) {
    // DSL定義があれば登録（優先）
    const yamlContent = dslDefinitions.get(cardId);
    if (yamlContent) {
      loadCardFromYaml(yamlContent);
      continue;
    }

    // なければクラス定義マップから登録
    const register = additionalRuleRegistrations.get(cardId);
    if (register) {
      register();
    }
  }
}
