/**
 * endPhase.ts - エンドフェイズ系ステップビルダー
 *
 * 公開関数:
 * - queueEndPhaseEffectStep: エンドフェイズ効果を登録
 *
 * @module domain/effects/steps/endPhase
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";

/** エンドフェイズに処理される効果を登録するステップ */
export function queueEndPhaseEffectStep(
  effectStep: AtomicStep,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): AtomicStep {
  return {
    id: options?.id ?? `queue-end-phase-effect-${effectStep.id}`,
    summary: options?.summary ?? "エンドフェイズ効果を登録",
    description: options?.description ?? "エンドフェイズに処理される効果を登録します",
    notificationLevel: "silent",
    action: (currentState: GameSnapshot): GameStateUpdateResult => {
      const updatedState: GameSnapshot = {
        ...currentState,
        queuedEndPhaseEffectIds: [...currentState.queuedEndPhaseEffectIds, effectStep.id],
      };

      return {
        success: true,
        updatedState,
        message: `Added end phase effect: ${effectStep.summary}`,
      };
    },
  };
}
