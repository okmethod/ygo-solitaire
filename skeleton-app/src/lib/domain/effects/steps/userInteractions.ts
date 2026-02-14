/**
 * interaction.ts - ユーザーインタラクション系ステップビルダー
 *
 * 公開関数:
 * - notifyActivationStep: 発動通知
 * - selectCardsStep: カード選択モーダル表示
 *
 * @module domain/effects/steps/interaction
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { AtomicStep, CardSelectionConfig } from "$lib/domain/models/AtomicStep";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { CardInstance } from "$lib/domain/models/Card";
import type { ZoneName } from "$lib/domain/models/Zone";
import { getCardNameWithBrackets } from "$lib/domain/registries/CardDataRegistry";

/** 発動を通知するステップ */
export const notifyActivationStep = (cardId: number): AtomicStep => {
  return {
    id: `${cardId}-activation-notification`,
    summary: "カード発動",
    description: `${getCardNameWithBrackets(cardId)}を発動します`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      return {
        success: true,
        updatedState: currentState,
        message: `${getCardNameWithBrackets(cardId)} activated`,
      };
    },
  };
};

/** カード選択モーダルを開き、ユーザーの選択を受け付けるステップ*/
export const selectCardsStep = (config: {
  id: string;
  summary: string;
  description: string;
  availableCards: readonly CardInstance[] | null;
  _sourceZone?: ZoneName;
  _filter?: (card: CardInstance, index?: number) => boolean;
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
      _sourceZone: config._sourceZone,
      _filter: config._filter,
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
