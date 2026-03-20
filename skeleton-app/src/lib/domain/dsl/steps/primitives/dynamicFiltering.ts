/**
 * dynamicFiltering.ts - 動的フィルタリングユーティリティ
 *
 * DSLステップで動的な値参照（例: paidCosts）を解決するためのヘルパー。
 * ステップ実行時に EffectActivationContext や GameSnapshot から値を取得する。
 */

import type { EffectId } from "$lib/domain/models/Effect";
import type { GameSnapshot, EffectActivationContext } from "$lib/domain/models/GameState";

// ===========================
// 型定義
// ===========================

/** 動的参照キー（コスト支払い枚数など） */
export type DynamicLevelRef = "paidCosts";

/** フィルターレベル引数の型（静的な数値または動的参照） */
export type FilterLevelArg = number | DynamicLevelRef;

// ===========================
// 判定関数
// ===========================

/**
 * 値が動的参照かどうかを判定
 */
export const isDynamicLevelRef = (value: unknown): value is DynamicLevelRef => {
  return value === "paidCosts";
};

// ===========================
// 解決関数
// ===========================

/**
 * 動的参照からレベル値を解決（EffectActivationContext から直接取得）
 *
 * cardSelectionConfig の _filter 内で使用。
 * UI表示時にコンテキストを直接参照できる場合に使用する。
 */
export const resolveDynamicLevelFromContext = (
  ref: DynamicLevelRef,
  context?: EffectActivationContext,
): number | undefined => {
  switch (ref) {
    case "paidCosts":
      return context?.paidCosts;
    default:
      return undefined;
  }
};

/**
 * 動的参照からレベル値を解決（GameSnapshot + effectId から取得）
 *
 * action 関数内で使用。
 * ステップ実行時に state から effectId を使ってコンテキストを取得する。
 */
export const resolveDynamicLevelFromState = (
  ref: DynamicLevelRef,
  state: GameSnapshot,
  effectId?: EffectId,
): number | undefined => {
  if (!effectId) return undefined;
  const context = state.activationContexts[effectId];
  return resolveDynamicLevelFromContext(ref, context);
};
