/**
 * battlePosition.ts - 表示形式変更ステップビルダー
 *
 * StepBuilder:
 * - changeBattlePositionStepBuilder: 表示形式変更
 */

import type { BattlePosition } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilderFn } from "$lib/domain/dsl/types";

/**
 * 表示形式変更ステップ
 *
 * sourceInstance のバトルポジションを指定した表示形式に変更する。
 * 誘発効果などで自身の表示形式を変更する場合に使用。
 */
export const changeBattlePositionStep = (instanceId: string, targetPosition: BattlePosition): AtomicStep => {
  const positionJa = targetPosition === "attack" ? "攻撃表示" : "守備表示";

  return {
    id: `change-battle-position-${instanceId}-${targetPosition}`,
    summary: `${positionJa}にする`,
    description: `表示形式を${positionJa}に変更します`,
    notificationLevel: "info",
    action: (currentState: GameSnapshot): GameStateUpdateResult => {
      const card = GameState.Space.findCard(currentState.space, instanceId);
      if (!card) {
        return GameProcessing.Result.failure(currentState, `Card not found: ${instanceId}`);
      }

      // フィールド上にいない場合はエラー
      if (!card.stateOnField) {
        return GameProcessing.Result.failure(currentState, `Card is not on the field: ${instanceId}`);
      }

      // 既に同じ表示形式の場合は何もしない
      if (card.stateOnField.battlePosition === targetPosition) {
        return GameProcessing.Result.success(currentState, `Already in ${targetPosition} position`);
      }

      // 表示形式を変更
      const updatedSpace = GameState.Space.updateCardStateInPlace(currentState.space, card, {
        battlePosition: targetPosition,
        // 守備表示の場合は表側表示にする（セット状態からの変更ではないため）
        position: "faceUp",
      });

      const updatedState: GameSnapshot = { ...currentState, space: updatedSpace };
      return GameProcessing.Result.success(updatedState, `Changed to ${targetPosition} position`);
    },
  };
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * CHANGE_BATTLE_POSITION - 表示形式変更
 * args: { position: "attack" | "defense" }
 */
export const changeBattlePositionStepBuilder: StepBuilderFn = (args, context) => {
  const position = args.position as BattlePosition;
  if (position !== "attack" && position !== "defense") {
    throw new Error('CHANGE_BATTLE_POSITION step requires position to be "attack" or "defense"');
  }
  const instanceId = context.sourceInstanceId;
  if (!instanceId) {
    throw new Error("CHANGE_BATTLE_POSITION step requires sourceInstanceId in context");
  }
  return changeBattlePositionStep(instanceId, position);
};
