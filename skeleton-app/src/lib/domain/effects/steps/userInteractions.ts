/**
 * interaction.ts - ユーザーインタラクション系ステップビルダー
 *
 * 公開関数:
 * - notifyActivationStep: 発動通知
 * - selectCardsStep: カード選択モーダル表示
 *
 * @module domain/effects/steps/interaction
 */

import type { LocationName } from "$lib/domain/models/Location";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult, CardSelectionConfig } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { getCardNameWithBrackets } from "$lib/domain/registries/CardDataRegistry";

/** 発動を通知するステップ */
export const notifyActivationStep = (cardId: number): AtomicStep => {
  return {
    id: `${cardId}-activation-notification`,
    summary: "カード発動",
    description: `${getCardNameWithBrackets(cardId)}を発動します`,
    notificationLevel: "info",
    action: (currentState: GameSnapshot): GameStateUpdateResult => {
      return GameProcessing.Result.success(currentState, `${getCardNameWithBrackets(cardId)} activated`);
    },
  };
};

/** カード選択モーダルを開き、ユーザーの選択を受け付けるステップ*/
export const selectCardsStep = (config: {
  id: string;
  summary: string;
  description: string;
  availableCards: readonly CardInstance[] | null;
  _sourceZone?: LocationName;
  _filter?: (card: CardInstance, index?: number) => boolean;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
  onSelect: (state: GameSnapshot, selectedIds: string[]) => GameStateUpdateResult;
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
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // カードが選択されていない場合（minCards = 0の場合に発生しうる）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return config.onSelect(currentState, []);
      }
      // 選択されたカードIDを使ってonSelectコールバックを実行
      return config.onSelect(currentState, selectedInstanceIds);
    },
  };
};
