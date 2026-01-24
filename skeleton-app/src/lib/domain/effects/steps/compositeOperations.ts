/**
 * compositeOperations.ts - 複合操作系ステップビルダー
 *
 * 公開ステップ:
 * - selectReturnShuffleDrawStep: 手札から選択してデッキに戻し、シャッフルして同じ枚数ドロー
 *
 * @module domain/effects/steps/compositeOperations
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { shuffleDeck, moveCard, drawCards } from "$lib/domain/models/Zone";
import { selectCardsStep } from "$lib/domain/effects/steps/userInteractions";

/**
 * 手札から任意枚数を選択してデッキに戻し、シャッフルして同じ枚数ドローするステップ
 *
 * 任意枚数選択→デッキに戻す→シャッフル→ドローを1ステップで実行する。
 * 通知は「n枚をデッキに戻し、シャッフルしてn枚ドローしました」とまとめて表示される。
 * 選択した枚数を記録する必要があるため、1つのステップとしてまとめて実装している。
 */
export const selectReturnShuffleDrawStep = (options: { min: number; max?: number }): AtomicStep => {
  return selectCardsStep({
    id: "select-and-return-to-deck",
    summary: "手札をデッキに戻す",
    description: `デッキに戻すカードを選択してください（${options.min}〜${options.max ?? 100}枚）`,
    availableCards: null, // 動的指定: 実行時に手札から取得
    _sourceZone: "hand",
    _filter: undefined, // 全て対象
    minCards: options.min,
    maxCards: options.max ?? 100,
    cancelable: false,
    onSelect: (currentState: GameState, selectedInstanceIds: string[]) => {
      // 0枚選択の場合は何もしない
      if (selectedInstanceIds.length === 0) {
        return {
          success: true,
          updatedState: currentState,
          message: "No cards selected",
        };
      }

      let updatedZones = currentState.zones;

      // 選択したカードをデッキに戻す
      for (const instanceId of selectedInstanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "hand", "deck");
      }

      // デッキをシャッフル
      updatedZones = shuffleDeck(updatedZones);

      // 同じ枚数ドロー
      updatedZones = drawCards(updatedZones, selectedInstanceIds.length);

      return {
        success: true,
        updatedState: {
          ...currentState,
          zones: updatedZones,
        },
        message: `${selectedInstanceIds.length}枚をデッキに戻し、シャッフルして${selectedInstanceIds.length}枚ドローしました`,
      };
    },
  });
};
