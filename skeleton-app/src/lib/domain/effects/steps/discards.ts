/**
 * discards.ts - カード破棄系ステップビルダー
 *
 * 公開関数:
 * - sendToGraveyardStep: カードを墓地へ送る
 * - discardAllHandStep: 手札を全て捨てる
 * - discardAllHandEndPhaseStep: エンドフェイズに手札を全て捨てる
 * - selectAndDiscardStep: 手札から指定枚数を選択して捨てる
 *
 * TODO: 「墓地の送る」と「捨てる」を区別する
 *
 * @module domain/effects/steps/discards
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { queueEndPhaseEffectStep } from "$lib/domain/effects/steps/endPhase";
import { selectCardsStep } from "$lib/domain/effects/steps/userInteractions";

/** 指定カードを墓地に送るステップ */
export const sendToGraveyardStep = (instanceId: string, cardName: string): AtomicStep => {
  return {
    id: `send-${instanceId}-to-graveyard`,
    summary: "墓地へ送る",
    description: `《${cardName}》を墓地に送ります`,
    notificationLevel: "info",
    action: (currentState: GameSnapshot): GameStateUpdateResult => {
      const card = GameState.Space.findCard(currentState.space, instanceId)!;
      const updatedState: GameSnapshot = {
        ...currentState,
        space: GameState.Space.moveCard(currentState.space, card, "graveyard"),
      };

      return GameProcessing.Result.success(updatedState, `Sent ${cardName} to graveyard`);
    },
  };
};

/** 指定した複数カードを墓地に移動した後のゲーム状態 */
const sendMultipleToGraveyardResult = (state: GameSnapshot, instanceIds: string[]): GameStateUpdateResult => {
  let updatedSpace = state.space;
  for (const instanceId of instanceIds) {
    const card = GameState.Space.findCard(updatedSpace, instanceId)!;
    updatedSpace = GameState.Space.moveCard(updatedSpace, card, "graveyard");
  }

  const updatedState = { ...state, space: updatedSpace };
  return GameProcessing.Result.success(
    updatedState,
    `Sent ${instanceIds.length} card${instanceIds.length > 1 ? "s" : ""} to graveyard`,
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
    notificationLevel: "info",
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

/** 手札から指定枚数のカードを選択して捨てるステップ */
export const selectAndDiscardStep = (cardCount: number, cancelable?: boolean): AtomicStep => {
  return selectCardsStep({
    id: `select-and-discard-${cardCount}-cards`,
    summary: `手札を${cardCount}枚捨てる`,
    description: `手札から${cardCount}枚選んで捨てます`,
    availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
    _sourceZone: "hand",
    _filter: undefined, // 全て対象
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
