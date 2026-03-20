/**
 * targeting.ts - 対象選択系ステップビルダー
 *
 * フィールドや墓地からカードを対象に取り、EffectActivationContext に保存するステップ。
 * 装備魔法や蘇生魔法など、対象を取る効果の発動時に使用する。
 *
 * StepBuilder:
 * - selectTargetFromFieldByRaceStepBuilder: フィールドから種族指定でモンスターを対象に取る
 * - selectTargetFromGraveyardStepBuilder: 墓地からモンスターを対象に取る
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { EffectId } from "$lib/domain/models/Effect";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";

// ===========================
// AtomicStep 生成関数
// ===========================

/**
 * フィールドから種族指定でモンスターを選択し、対象としてコンテキストに保存するステップ（発動時に使用）
 *
 * 装備魔法など、特定種族のモンスターを対象に取る場合に使用。
 *
 * @param cardId - カードID
 * @param effectId - 効果ID（コンテキストのキー）
 * @param race - 種族（例: "Spellcaster"）
 */
export const selectTargetFromFieldByRaceStep = (cardId: number, effectId: EffectId, race: string): AtomicStep => {
  const summary = "装備対象を選択";
  const description = `フィールドの${race}モンスター1体を対象に取ります`;
  const filter = (card: CardInstance): boolean => {
    if (card.type !== "monster") return false;
    if (card.race !== race) return false;
    if (!card.stateOnField || card.stateOnField.position !== "faceUp") return false;
    return true;
  };

  return {
    id: `${cardId}-select-target-from-field-by-race-${race}`,
    summary,
    description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
      minCards: 1,
      maxCards: 1,
      summary,
      description,
      cancelable: false,
      _sourceZone: "mainMonsterZone",
      _filter: filter,
    },
    action: (state: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(state, "No target selected");
      }

      // 対象をコンテキストに保存
      const updatedState: GameSnapshot = {
        ...state,
        activationContexts: GameState.ActivationContext.setTargets(
          state.activationContexts,
          effectId,
          selectedInstanceIds,
        ),
      };

      const targetCard = GameState.Space.findCard(state.space, selectedInstanceIds[0]);
      return GameProcessing.Result.success(
        updatedState,
        `Selected ${targetCard?.jaName ?? selectedInstanceIds[0]} as equip target`,
      );
    },
  };
};

/**
 * 墓地からモンスターを選択し、対象としてコンテキストに保存するステップ（発動時に使用）
 *
 * @param cardId - カードID
 * @param effectId - 効果ID（コンテキストのキー）
 */
export const selectTargetFromGraveyardStep = (cardId: number, effectId: EffectId): AtomicStep => {
  const summary = "蘇生対象を選択";
  const description = "墓地からモンスター1体を対象に取ります";
  const filter = (card: CardInstance): boolean => card.type === "monster";

  return {
    id: `${cardId}-select-target-from-graveyard`,
    summary,
    description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
      minCards: 1,
      maxCards: 1,
      summary,
      description,
      cancelable: false,
      _sourceZone: "graveyard",
      _filter: filter,
    },
    action: (state: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(state, "No target selected");
      }

      // 対象をコンテキストに保存
      const updatedState: GameSnapshot = {
        ...state,
        activationContexts: GameState.ActivationContext.setTargets(
          state.activationContexts,
          effectId,
          selectedInstanceIds,
        ),
      };

      const targetCard = GameState.Space.findCard(state.space, selectedInstanceIds[0]);
      return GameProcessing.Result.success(
        updatedState,
        `Selected ${targetCard?.jaName ?? selectedInstanceIds[0]} as target`,
      );
    },
  };
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SELECT_TARGET_FROM_FIELD_BY_RACE - フィールドから種族指定でモンスターを対象に取る
 * args: { race: string }
 */
export const selectTargetFromFieldByRaceStepBuilder: StepBuilderFn = (args, context) => {
  if (!context.effectId) {
    throw new Error("SELECT_TARGET_FROM_FIELD_BY_RACE step requires effectId in context");
  }
  const race = ArgValidators.nonEmptyString(args, "race");
  return selectTargetFromFieldByRaceStep(context.cardId, context.effectId, race);
};

/**
 * SELECT_TARGET_FROM_GRAVEYARD - 墓地からモンスターを選択し対象に取る
 * args: なし
 */
export const selectTargetFromGraveyardStepBuilder: StepBuilderFn = (_args, context) => {
  if (!context.effectId) {
    throw new Error("SELECT_TARGET_FROM_GRAVEYARD step requires effectId in context");
  }
  return selectTargetFromGraveyardStep(context.cardId, context.effectId);
};
