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
}

/** 発動時コンテキストに対象を設定する */
export function setActivationTargets(
  currentContexts: Record<EffectId, EffectActivationContext>,
  effectId: EffectId,
  targets: readonly string[],
): Record<EffectId, EffectActivationContext> {
  return {
    ...currentContexts,
    [effectId]: { targets },
  };
}

/** 発動時コンテキストから、ある効果に指定された対象を取得する */
export function getActivationTargets(
  currentContexts: Record<EffectId, EffectActivationContext>,
  effectId: EffectId,
): readonly string[] {
  return currentContexts?.[effectId]?.targets ?? [];
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
