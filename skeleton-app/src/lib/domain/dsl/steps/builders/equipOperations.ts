/**
 * equipOperations.ts - 装備関連ステップビルダー
 *
 * 装備カードの装備関係確立を行うステップ。
 * EquipSpellActivation のインライン実装を共通ステップ化したもの。
 *
 * StepBuilder:
 * - establishEquipStepBuilder: 装備関係を確立
 *
 * @module domain/effects/steps/builders/equipOperations
 */

import type { EffectId } from "$lib/domain/models/Effect";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import type { StepBuilder } from "../AtomicStepRegistry";

// ===========================
// ステップ関数（export）
// ===========================

/**
 * 装備関係を確立するステップ
 *
 * activationContext から対象モンスターを取得し、装備カードの equippedTo を設定する。
 * 処理完了後に activationContext をクリアする。
 *
 * @param effectId - 効果ID（activationContext のキー）
 * @param equipCardInstanceId - 装備カードのインスタンスID
 */
export const establishEquipStep = (effectId: EffectId, equipCardInstanceId: string): AtomicStep => ({
  id: `establish-equip-${effectId}`,
  summary: "装備関係確立",
  description: "装備カードをモンスターに装備します",
  notificationLevel: "silent",
  action: (state: GameSnapshot): GameStateUpdateResult => {
    // 1. activationContext から対象を取得
    const targets = GameState.ActivationContext.getTargets(state.activationContexts, effectId);
    if (targets.length === 0) {
      return GameProcessing.Result.failure(state, "No equip target found in activation context");
    }
    const targetInstanceId = targets[0];

    // 2. 装備カードを見つける
    const equipCard = GameState.Space.findCard(state.space, equipCardInstanceId);
    if (!equipCard) {
      return GameProcessing.Result.failure(state, `Equip card not found: ${equipCardInstanceId}`);
    }
    if (!equipCard.stateOnField) {
      return GameProcessing.Result.failure(state, "Equip card is not on the field");
    }

    // 3. 装備対象のモンスターが存在するか確認
    const targetCard = GameState.Space.findCard(state.space, targetInstanceId);
    if (!targetCard) {
      return GameProcessing.Result.failure(state, `Equip target not found: ${targetInstanceId}`);
    }

    // 4. 装備カードの stateOnField.equippedTo を更新
    const updatedSpace = GameState.Space.updateCardStateInPlace(state.space, equipCard, {
      equippedTo: targetInstanceId,
    });

    // 5. activationContext をクリア
    const updatedState: GameSnapshot = {
      ...state,
      space: updatedSpace,
      activationContexts: GameState.ActivationContext.clear(state.activationContexts, effectId),
    };

    return GameProcessing.Result.success(updatedState, `Equipped to ${targetCard.jaName ?? targetInstanceId}`);
  },
});

/**
 * 装備を外すステップ
 *
 * 装備カードの equippedTo をクリアする。
 * 装備モンスターがフィールドを離れた場合などに使用。
 *
 * @param equipCardInstanceId - 装備カードのインスタンスID
 */
export const unequipStep = (equipCardInstanceId: string): AtomicStep => ({
  id: `unequip-${equipCardInstanceId}`,
  summary: "装備解除",
  description: "装備を解除します",
  notificationLevel: "silent",
  action: (state: GameSnapshot): GameStateUpdateResult => {
    const equipCard = GameState.Space.findCard(state.space, equipCardInstanceId);
    if (!equipCard) {
      return GameProcessing.Result.failure(state, `Equip card not found: ${equipCardInstanceId}`);
    }
    if (!equipCard.stateOnField) {
      // 既にフィールドにない場合は成功扱い
      return GameProcessing.Result.success(state, "Equip card is not on field");
    }

    const updatedSpace = GameState.Space.updateCardStateInPlace(state.space, equipCard, {
      equippedTo: undefined,
    });

    const updatedState: GameSnapshot = {
      ...state,
      space: updatedSpace,
    };

    return GameProcessing.Result.success(updatedState, `Unequipped ${equipCard.jaName ?? equipCardInstanceId}`);
  },
});

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * ESTABLISH_EQUIP - 装備関係を確立
 * args: { effectId?: string, equipCardInstanceId?: string }
 *
 * effectId と equipCardInstanceId が省略された場合は context から取得する。
 */
export const establishEquipStepBuilder: StepBuilder = (args, context) => {
  const effectIdFromArgs = ArgValidators.optionalString(args, "effectId");
  const effectId = effectIdFromArgs ? (effectIdFromArgs as EffectId) : context.effectId;
  const equipCardInstanceId = ArgValidators.optionalString(args, "equipCardInstanceId") ?? context.sourceInstanceId;

  if (!effectId) {
    throw new Error("ESTABLISH_EQUIP step requires effectId (via args or context)");
  }
  if (!equipCardInstanceId) {
    throw new Error("ESTABLISH_EQUIP step requires equipCardInstanceId (via args or context)");
  }

  return establishEquipStep(effectId, equipCardInstanceId);
};

/**
 * UNEQUIP - 装備を解除
 * args: { equipCardInstanceId?: string }
 *
 * equipCardInstanceId が省略された場合は context.sourceInstanceId を使用する。
 */
export const unequipStepBuilder: StepBuilder = (args, context) => {
  const equipCardInstanceId = ArgValidators.optionalString(args, "equipCardInstanceId") ?? context.sourceInstanceId;

  if (!equipCardInstanceId) {
    throw new Error("UNEQUIP step requires equipCardInstanceId (via args or context)");
  }

  return unequipStep(equipCardInstanceId);
};
