/**
 * ActivationContext - 効果発動時のコンテキスト管理
 */

import type { EffectId } from "$lib/domain/models/Effect";

/**
 * 効果ごとの発動時コンテキスト
 *
 * ACTIVATION時に選択した対象などの情報を保持し、RESOLUTION時に参照する。
 */
export interface EffectActivationContext {
  /** 対象に取ったカードのinstanceId配列 */
  readonly targets: readonly string[];
  /** 支払ったコストの数*/
  readonly paidCosts?: number;
}

/** 発動時コンテキストに対象を設定する */
export function setActivationTargets(
  currentContexts: Record<EffectId, EffectActivationContext>,
  effectId: EffectId,
  targets: readonly string[],
): Record<EffectId, EffectActivationContext> {
  const existing = currentContexts[effectId] ?? { targets: [] };
  return {
    ...currentContexts,
    [effectId]: { ...existing, targets },
  };
}

/** 発動時コンテキストから、ある効果に指定された対象を取得する */
export function getActivationTargets(
  currentContexts: Record<EffectId, EffectActivationContext>,
  effectId: EffectId,
): readonly string[] {
  return currentContexts?.[effectId]?.targets ?? [];
}

/** 発動時コンテキストに支払ったコストの数を設定する */
export function setPaidCosts(
  currentContexts: Record<EffectId, EffectActivationContext>,
  effectId: EffectId,
  paidCosts: number,
): Record<EffectId, EffectActivationContext> {
  const existing = currentContexts[effectId] ?? { targets: [] };
  return {
    ...currentContexts,
    [effectId]: { ...existing, paidCosts },
  };
}

/** 発動時コンテキストから支払ったコストの数を取得する */
export function getPaidCosts(
  currentContexts: Record<EffectId, EffectActivationContext>,
  effectId: EffectId,
): number | undefined {
  return currentContexts?.[effectId]?.paidCosts;
}

/** 発動時コンテキストから、ある効果に指定された対象をクリアする */
export function clearActivationContext(
  currentContexts: Record<EffectId, EffectActivationContext>,
  effectId: EffectId,
): Record<EffectId, EffectActivationContext> {
  if (!(effectId in currentContexts)) {
    return currentContexts;
  }

  const { [effectId]: _, ...remainingContext } = currentContexts;
  return remainingContext;
}
