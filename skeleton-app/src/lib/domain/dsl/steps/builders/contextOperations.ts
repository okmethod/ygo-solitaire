/**
 * contextOperations.ts - EffectActivationContext 操作系ステップビルダー
 *
 * 効果解決時の状態共有（対象選択結果の保存・取得）を行うステップ。
 * 対象を取る効果で使用される。
 *
 * StepBuilder:
 * - saveTargetsToContextStepBuilder: 選択対象をコンテキストに保存
 * - clearContextStepBuilder: コンテキストをクリア
 *
 * @module domain/effects/steps/builders/contextOperations
 */

import type { EffectId } from "$lib/domain/models/Effect";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";

// ===========================
// ステップ関数（export）
// ===========================

/**
 * 選択結果を activationContext に保存するステップ
 *
 * 対象を取る効果で、選択ステップと解決ステップの間で対象情報を共有するために使用する。
 * selectCardsStep の onSelect 内で呼び出すか、独立したステップとして使用できる。
 *
 * @param effectId - 効果ID（コンテキストのキー）
 * @param summary - ステップの要約（省略時: "対象を保存"）
 */
export const saveTargetsToContextStep = (effectId: EffectId, summary: string = "対象を保存"): AtomicStep => ({
  id: `save-targets-${effectId}`,
  summary,
  description: "対象にとったカードをコンテキストに保存します",
  notificationLevel: "silent",
  action: (state: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
    if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
      return GameProcessing.Result.failure(state, "No targets selected to save");
    }

    const updatedState: GameSnapshot = {
      ...state,
      activationContexts: GameState.ActivationContext.setTargets(
        state.activationContexts,
        effectId,
        selectedInstanceIds,
      ),
    };

    return GameProcessing.Result.success(updatedState, `Saved ${selectedInstanceIds.length} target(s) to context`);
  },
});

/**
 * activationContext から対象を取得するヘルパー関数
 *
 * ステップの action 内で使用する。
 *
 * @param state - 現在のゲーム状態
 * @param effectId - 効果ID
 * @returns 保存されている対象のインスタンスID配列
 */
export const getTargetsFromContext = (state: GameSnapshot, effectId: EffectId): readonly string[] => {
  return GameState.ActivationContext.getTargets(state.activationContexts, effectId);
};

/**
 * activationContext をクリアするステップ
 *
 * 効果解決完了後にコンテキストをクリアするために使用する。
 * 通常は equipOperations.ts の establishEquipStep など、
 * 最終処理で自動的にクリアされるため、明示的に使用する必要は少ない。
 *
 * @param effectId - 効果ID（コンテキストのキー）
 */
export const clearContextStep = (effectId: EffectId): AtomicStep => ({
  id: `clear-context-${effectId}`,
  summary: "コンテキストクリア",
  description: "効果解決コンテキストをクリアします",
  notificationLevel: "silent",
  action: (state: GameSnapshot): GameStateUpdateResult => {
    const updatedState: GameSnapshot = {
      ...state,
      activationContexts: GameState.ActivationContext.clear(state.activationContexts, effectId),
    };
    return GameProcessing.Result.success(updatedState, "Context cleared");
  },
});

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SAVE_TARGETS_TO_CONTEXT - 選択対象をコンテキストに保存
 * args: { effectId?: string, summary?: string }
 *
 * effectId が省略された場合は context.effectId を使用する。
 */
export const saveTargetsToContextStepBuilder: StepBuilderFn = (args, context) => {
  const effectIdFromArgs = ArgValidators.optionalString(args, "effectId");
  const effectId = effectIdFromArgs ? (effectIdFromArgs as EffectId) : context.effectId;
  if (!effectId) {
    throw new Error("SAVE_TARGETS_TO_CONTEXT step requires effectId (via args or context)");
  }
  const summary = ArgValidators.optionalString(args, "summary");
  return saveTargetsToContextStep(effectId, summary);
};

/**
 * CLEAR_CONTEXT - コンテキストをクリア
 * args: { effectId?: string }
 *
 * effectId が省略された場合は context.effectId を使用する。
 */
export const clearContextStepBuilder: StepBuilderFn = (args, context) => {
  const effectIdFromArgs = ArgValidators.optionalString(args, "effectId");
  const effectId = effectIdFromArgs ? (effectIdFromArgs as EffectId) : context.effectId;
  if (!effectId) {
    throw new Error("CLEAR_CONTEXT step requires effectId (via args or context)");
  }
  return clearContextStep(effectId);
};
