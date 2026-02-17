/**
 * Effect モデル
 *
 * 効果処理によるゲーム操作基盤。
 * 効果処理は、この仕組みを通してゲーム状態を更新する。
 *
 * @module domain/models/Effect
 * @see {@link docs/domain/effect-model.md}
 * @see {@link docs/domain/effects}
 */

export type { ChainableAction, ActionEffectCategory } from "./ChainableAction";
export type { AdditionalRule, RuleEffectCategory, RuleCategory } from "./AdditionalRule";
export type { EffectId } from "./EffectId";

import * as EffectIdFuncs from "./EffectId";

/* Effect 名前空間
 *
 * 効果に関する純粋関数（ロジック）を階層的に集約する。
 */
export const Effect = {
  Id: {
    create: EffectIdFuncs.createEffectId,
  },
} as const;
