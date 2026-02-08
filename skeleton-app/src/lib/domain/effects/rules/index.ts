/**
 * AdditionalRule Effect Library - 適用する効果ライブラリ
 *
 * TODO: 選んだデッキレシピに含まれるカードの効果のみ登録するように最適化したい
 * *
 * @module domain/effects/rules
 */

import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";

// 永続効果
import { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/spells/ChickenGameContinuousEffect";
import { RoyalMagicalLibraryContinuousEffect } from "$lib/domain/effects/rules/monsters/RoyalMagicalLibraryContinuousEffect";

/** 適用する効果:追加適用されるルール のレジストリを初期化する */
export function initializeAdditionalRuleRegistry(): void {
  // 永続効果
  AdditionalRuleRegistry.register(67616300, new ChickenGameContinuousEffect());
  AdditionalRuleRegistry.register(70791313, new RoyalMagicalLibraryContinuousEffect());
}
