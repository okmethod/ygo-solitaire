/**
 * AdditionalRule Effect Library - 適用する効果ライブラリ
 *
 * @module domain/effects/rules
 */

import { AdditionalRuleRegistry } from "$lib/domain/effects/rules/AdditionalRuleRegistry";
export { AdditionalRuleRegistry };

// 永続効果
import { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/continuouses/spells/ChickenGameContinuousEffect";
import { RoyalMagicalLibraryContinuousEffect } from "$lib/domain/effects/rules/continuouses/monsters/RoyalMagicalLibraryContinuousEffect";

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
// 定義マップ
// ===========================

/** カードID → 登録関数のマッピング */
const additionalRuleRegistrations = new Map<number, () => void>([
  rule(67616300, new ChickenGameContinuousEffect()),
  rule(70791313, new RoyalMagicalLibraryContinuousEffect()),
]);

// ===========================
// 登録関数
// ===========================

/** レジストリをクリアし、指定されたカードIDの AdditionalRule を登録する。 */
export function registerAdditionalRulesByIds(cardIds: number[]): void {
  AdditionalRuleRegistry.clear();

  for (const cardId of cardIds) {
    const register = additionalRuleRegistrations.get(cardId);
    if (register) {
      register();
    }
  }
}
