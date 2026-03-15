/**
 * timing.ts - タイミング制御系ステップビルダー
 *
 * StepBuilder:
 * - thenStepBuilder: 「その後」タイミングマーカー
 *
 * 純粋関数:
 * - isThenMarker: ステップが THEN マーカーかどうか判定
 */

import type { AtomicStep } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilder } from "../AtomicStepRegistry";

/** THEN マーカーの step ID */
const THEN_MARKER_ID = "then-marker";

/** THEN（「その後」）マーカーを通知するステップ */
export function markThenStep(): AtomicStep {
  return {
    id: THEN_MARKER_ID,
    summary: "タイミング進行",
    description: "「その後」処理によりタイミングが進む",
    notificationLevel: "silent",
    action: (state) => GameProcessing.Result.success(state),
  };
}

/** 指定されたステップが THEN マーカーかどうかを判定する */
export function isThenMarker(step: AtomicStep): boolean {
  return step.id === THEN_MARKER_ID;
}

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * THEN - 「その後」タイミングマーカー
 * args: none
 */
export const thenStepBuilder: StepBuilder = () => markThenStep();
