/**
 * discards.ts - カード破棄系ステップビルダー
 *
 * StepBuilder:
 * - selectAndDiscardStepBuilder: 手札から指定枚数選んで捨てる
 * - discardAllHandEndPhaseStepBuilder: エンドフェイズに手札を全て捨てる
 *
 * TODO: 「墓地の送る」と「捨てる」を区別する
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameEvent, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { GameEvents } from "$lib/domain/models/GameProcessing/GameEvent";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { selectCardsStep } from "../primitives/userInteractions";
import { queueEndPhaseEffectStep } from "../primitives/endPhase";

/**
 * 指定カードを墓地に送るステップ
 *
 * sentToGraveyard イベントを発行し、クリッター等の誘発効果をトリガーする。
 */
export const sendToGraveyardStep = (instanceId: string, cardName: string): AtomicStep => {
  return {
    id: `send-${instanceId}-to-graveyard`,
    summary: "墓地へ送る",
    description: `《${cardName}》を墓地に送ります`,
    notificationLevel: "static",
    action: (currentState: GameSnapshot): GameStateUpdateResult => {
      const card = GameState.Space.findCard(currentState.space, instanceId)!;
      const updatedState: GameSnapshot = {
        ...currentState,
        space: GameState.Space.moveCard(currentState.space, card, "graveyard"),
      };

      // sentToGraveyard イベントを発行（誘発効果のトリガー用）
      return GameProcessing.Result.success(
        updatedState,
        `Sent ${cardName} to graveyard`,
        GameEvents.sentToGraveyard(card),
      );
    },
  };
};

/**
 * 指定した複数カードを墓地に移動した後のゲーム状態
 *
 * 各カードに対して sentToGraveyard イベントを発行する。
 */
const sendMultipleToGraveyardResult = (state: GameSnapshot, instanceIds: string[]): GameStateUpdateResult => {
  let updatedSpace = state.space;
  const events: GameEvent[] = [];

  for (const instanceId of instanceIds) {
    const card = GameState.Space.findCard(updatedSpace, instanceId)!;
    updatedSpace = GameState.Space.moveCard(updatedSpace, card, "graveyard");
    events.push(...GameEvents.sentToGraveyard(card));
  }

  const updatedState = { ...state, space: updatedSpace };
  return GameProcessing.Result.success(
    updatedState,
    `Sent ${instanceIds.length} card${instanceIds.length > 1 ? "s" : ""} to graveyard`,
    events,
  );
};

/** 手札を全て捨てた後のゲーム状態 */
const discardAllHandResult = (state: GameSnapshot): GameStateUpdateResult => {
  const handCards = [...state.space.hand];

  // 手札が空の場合は何もしない
  if (handCards.length === 0) {
    return GameProcessing.Result.success(state, "No cards in hand to discard");
  }

  // 全ての手札カードを墓地へ送る
  const instanceIds = handCards.map((card) => card.instanceId);
  return sendMultipleToGraveyardResult(state, instanceIds);
};

/** 手札を全て捨てるステップ */
export const discardAllHandStep = (): AtomicStep => {
  return {
    id: "discard-all-hand",
    summary: "手札を全て捨てる",
    description: "手札を全て捨てます",
    notificationLevel: "static",
    action: (state: GameSnapshot): GameStateUpdateResult => {
      return discardAllHandResult(state);
    },
  };
};

/** エンドフェイズに手札を全て捨てるステップ */
export const discardAllHandEndPhaseStep = (): AtomicStep => {
  return queueEndPhaseEffectStep(discardAllHandStep(), {
    id: "end-phase-discard-all-hand",
    summary: "手札を全て捨てる",
    description: "エンドフェイズに手札を全て捨てます",
  });
};

/** カードタイプの日本語変換 */
const cardTypeToJapanese: Record<string, string> = {
  spell: "魔法",
  monster: "モンスター",
  trap: "罠",
};

/** 手札から指定枚数のカードを選択して捨てるステップ */
export const selectAndDiscardStep = (
  cardCount: number,
  cancelable?: boolean,
  filterType?: "spell" | "monster" | "trap",
  sourceCardId?: number,
): AtomicStep => {
  const filterTypeJa = filterType ? cardTypeToJapanese[filterType] : "";
  const summary = filterType ? `手札の${filterTypeJa}を${cardCount}枚捨てる` : `手札を${cardCount}枚捨てる`;
  const description = filterType
    ? `手札から${filterTypeJa}カードを${cardCount}枚選んで捨てます`
    : `手札から${cardCount}枚選んで捨てます`;

  return selectCardsStep({
    id: `select-and-discard-${cardCount}-${filterType ?? "any"}-cards`,
    sourceCardId,
    summary,
    description,
    availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
    _sourceZone: "hand",
    _filter: filterType ? (card) => card.type === filterType : undefined,
    minCards: cardCount,
    maxCards: cardCount,
    cancelable: cancelable ?? false, // Default: キャンセル不可
    onSelect: (currentState: GameSnapshot, selectedInstanceIds: string[]) => {
      // 指定枚数が選択されていない場合はエラー
      if (selectedInstanceIds.length !== cardCount) {
        return GameProcessing.Result.failure(
          currentState,
          `Must select exactly ${cardCount} card${cardCount > 1 ? "s" : ""} to discard`,
        );
      }
      return sendMultipleToGraveyardResult(currentState, selectedInstanceIds);
    },
  });
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SELECT_AND_DISCARD - 手札から指定枚数選んで捨てる
 * args: { count: number, cancelable?: boolean, filterType?: CardType }
 */
export const selectAndDiscardStepBuilder: StepBuilderFn = (args, context) => {
  const count = ArgValidators.positiveInt(args, "count");
  const cancelable = ArgValidators.optionalBoolean(args, "cancelable", false);
  const filterType = ArgValidators.optionalCardType(args, "filterType");
  return selectAndDiscardStep(count, cancelable, filterType, context.cardId);
};

/**
 * DISCARD_ALL_HAND_END_PHASE - エンドフェイズに手札を全て捨てる
 * args: none
 */
export const discardAllHandEndPhaseStepBuilder: StepBuilderFn = () => discardAllHandEndPhaseStep();
