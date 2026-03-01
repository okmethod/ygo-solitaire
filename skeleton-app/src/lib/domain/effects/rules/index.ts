/**
 * AdditionalRule Effect Library - 適用する効果ライブラリ
 *
 * @module domain/effects/rules
 */

import { AdditionalRuleRegistry } from "$lib/domain/effects/rules/AdditionalRuleRegistry";
export { AdditionalRuleRegistry };
export { BaseContinuousEffect } from "$lib/domain/effects/rules/continuouses/BaseContinuousEffect";

// ===========================
// DSL未対応カードのフォールバック
// ===========================

/** DSL未対応カードの定義マップ */
const additionalRuleRegistrations = new Map<number, () => void>([]);

/** DSL未対応カード定義マップから AdditionalRule を登録する */
export function registerAdditionalRuleFromMap(cardId: number): void {
  const register = additionalRuleRegistrations.get(cardId);
  if (register) {
    register();
  }
}
