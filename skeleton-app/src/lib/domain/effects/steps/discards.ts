/**
 * handDiscards.ts - 手札破棄系ステップビルダー
 *
 * 手札を破棄する AtomicStep を生成します。
 *
 * 公開関数:
 * - sendToGraveyardStep: カードを墓地へ送る
 * - discardAllHandStep: 手札を全て捨てる
 * - discardAllHandEndPhaseStep: エンドフェイズに手札を全て捨てる
 * - discardCardsSelectionStep: 手札から指定枚数を選択して捨てる
 *
 * TODO: 「墓地の送る」と「捨てる」を区別する
 *
 * @module domain/effects/steps/handDiscard
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { sendToGraveyard } from "$lib/domain/models/Zone";
import { selectCardsStep } from "$lib/domain/effects/steps/userInteractions";

/** 指定カードを墓地に送るステップ */
export const sendToGraveyardStep = (instanceId: string, cardName: string): AtomicStep => {
  return {
    id: `send-${instanceId}-to-graveyard`,
    summary: "墓地へ送る",
    description: `《${cardName}》を墓地に送ります`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      const updatedState: GameState = {
        ...currentState,
        zones: sendToGraveyard(currentState.zones, instanceId),
      };

      return {
        success: true,
        updatedState,
        message: `Sent ${cardName} to graveyard`,
      };
    },
  };
};

/** 指定した複数カードを墓地に移動した後のゲーム状態 */
const sendMultipleToGraveyardResult = (state: GameState, instanceIds: string[]): GameStateUpdateResult => {
  let updatedZones = state.zones;
  for (const instanceId of instanceIds) {
    updatedZones = sendToGraveyard(updatedZones, instanceId);
  }

  return {
    success: true,
    updatedState: {
      ...state,
      zones: updatedZones,
    },
    message: `Sent ${instanceIds.length} card${instanceIds.length > 1 ? "s" : ""} to graveyard`,
  };
};

/** 手札を全て捨てた後のゲーム状態 */
const discardAllHandResult = (state: GameState): GameStateUpdateResult => {
  const handCards = [...state.zones.hand];

  // 手札が空の場合は何もしない
  if (handCards.length === 0) {
    return {
      success: true,
      updatedState: state,
      message: "No cards in hand to discard",
    };
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
    action: (state: GameState): GameStateUpdateResult => {
      return discardAllHandResult(state);
    },
  };
};

/** エンドフェイズに手札を全て捨てるステップ */
export const discardAllHandEndPhaseStep = (): AtomicStep => {
  return {
    id: "end-phase-discard-all-hand",
    summary: "手札を全て捨てる",
    description: "エンドフェイズに手札を全て捨てます",
    notificationLevel: "info",
    action: (state: GameState): GameStateUpdateResult => {
      return discardAllHandResult(state);
    },
  };
};

/** 手札から指定枚数のカードを選択して捨てるステップ */
export const discardCardsSelectionStep = (cardCount: number, cancelable?: boolean): AtomicStep => {
  return selectCardsStep({
    id: `discard-selected-${cardCount}-cards`,
    summary: `手札を${cardCount}枚捨てる`,
    description: `手札から${cardCount}枚選んで捨てます`,
    availableCards: [], // 手札から選択（実行時に動的に設定）
    minCards: cardCount,
    maxCards: cardCount,
    cancelable: cancelable ?? false, // Default: キャンセル不可
    onSelect: (currentState: GameState, selectedInstanceIds: string[]) => {
      // 指定枚数が選択されていない場合はエラー
      if (selectedInstanceIds.length !== cardCount) {
        return {
          success: false,
          updatedState: currentState,
          error: `Must select exactly ${cardCount} card${cardCount > 1 ? "s" : ""} to discard`,
        };
      }
      return sendMultipleToGraveyardResult(currentState, selectedInstanceIds);
    },
  });
};
