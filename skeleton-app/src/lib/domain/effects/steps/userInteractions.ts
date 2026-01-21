/**
 * interaction.ts - ユーザーインタラクション系ステップビルダー
 *
 * 公開関数:
 * - selectCardsStep: カード選択モーダル表示
 *
 * @module domain/effects/steps/interaction
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, CardSelectionConfig } from "$lib/domain/models/AtomicStep";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { CardInstance } from "$lib/domain/models/Card";

/** カード選択モーダルを開き、ユーザーの選択を受け付けるステップ*/
export const selectCardsStep = (config: {
  id: string;
  summary: string;
  description: string;
  availableCards: readonly CardInstance[] | [];
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
  onSelect: (state: GameState, selectedIds: string[]) => GameStateUpdateResult;
}): AtomicStep => {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: config.availableCards,
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
    } satisfies CardSelectionConfig,
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // カードが選択されていない場合（minCards = 0の場合に発生しうる）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return config.onSelect(currentState, []);
      }
      // 選択されたカードIDを使ってonSelectコールバックを実行
      return config.onSelect(currentState, selectedInstanceIds);
    },
  };
};
