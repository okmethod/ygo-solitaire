/**
 * EffectId - 効果の一意識別子
 *
 * Branded Type を使用して型安全な効果IDを提供する。
 * 1ターンに1度制限の管理などで使用される。
 */

import type { ActionEffectCategory } from "./ChainableAction";

/**
 * 効果ID（Branded Type）
 *
 * 形式: "{category}-{cardId}" または "{category}-{cardId}-{effectIndex}"
 * 例: "activation-55144522", "ignition-67616300-1"
 */
export type EffectId = string & { readonly __brand: "EffectId" };

/** 効果IDを生成する */
export function createEffectId(category: ActionEffectCategory, cardId: number, effectIndex?: number): EffectId {
  if (effectIndex !== undefined) {
    return `${category}-${cardId}-${effectIndex}` as EffectId;
  }
  return `${category}-${cardId}` as EffectId;
}
