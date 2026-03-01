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

// 永続効果（DSL未対応のみ）
import { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/continuouses/spells/ChickenGameContinuousEffect";

// ===========================
// マップエントリ生成ヘルパー
// ===========================

import type { AdditionalRule } from "$lib/domain/models/Effect";

type RegistrationEntry = [number, () => void];

/** 永続効果のエントリを生成 */
const rule = (id: number, additionalRule: AdditionalRule): RegistrationEntry => [
  id,
  () => AdditionalRuleRegistry.register(id, additionalRule),
];

// ===========================
// 定義マップ（DSL未対応カードのみ）
// ===========================

const additionalRuleRegistrations = new Map<number, () => void>([rule(67616300, new ChickenGameContinuousEffect())]);

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
