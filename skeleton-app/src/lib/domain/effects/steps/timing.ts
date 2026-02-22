/**
 * timing - タイミング制御系ステップビルダー
 *
 * 公開関数:
 * - markThenStep: THEN マーカー
 *
 * @module domain/effects/steps/timing
 */

import type { AtomicStep } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/** THEN マーカーの step ID */
export const THEN_MARKER_ID = "then-marker";

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
