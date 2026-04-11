/**
 * interaction.ts - ユーザーインタラクション系ステップビルダー
 *
 * 公開関数:
 * - notifyActivationStep: 発動通知
 * - selectCardsStep: カード選択モーダル表示
 */

import type { LocationName } from "$lib/domain/models/Location";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { CardDataRegistry } from "$lib/domain/cards/CardDataRegistry"; // 循環インポートに注意

/** 発動を通知するステップ */
export const notifyActivationStep = (cardId: number): AtomicStep => {
  const cardName = CardDataRegistry.getCardNameWithBrackets(cardId);
  return {
    id: `${cardId}-activation-notification`,
    summary: "カード発動",
    description: `${cardName}を発動します`,
    notificationLevel: "static",
    action: (currentState: GameSnapshot): GameStateUpdateResult => {
      return GameProcessing.Result.success(currentState, `${cardName} activated`);
    },
  };
};

/** カード選択モーダルを開き、ユーザーの選択を受け付けるステップ*/
export const selectCardsStep = (config: {
  id: string;
  sourceCardId?: number;
  summary: string;
  description: string;
  availableCards: readonly CardInstance[] | null;
  _sourceZone?: LocationName;
  _filter?: (card: CardInstance, index?: number) => boolean;
  minCards: number;
  maxCards: number;
  /** 実行時に state から最大選択枚数を動的に算出する関数 */
  dynamicMaxCards?: (state: GameSnapshot) => number;
  cancelable?: boolean;
  /** 選択中のカードで確定可能かを判定（未指定時は minCards/maxCards のみでチェック） */
  canConfirm?: (selectedCards: readonly CardInstance[]) => boolean;
  /** 実行時に state を参照して確定可否を判定する関数 */
  dynamicCanConfirm?: (state: GameSnapshot, selectedCards: readonly CardInstance[]) => boolean;
  onSelect: (state: GameSnapshot, selectedIds: string[]) => GameStateUpdateResult;
}): AtomicStep => {
  return {
    id: config.id,
    sourceCardId: config.sourceCardId,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: (state: GameSnapshot) => ({
      availableCards: config.availableCards,
      _sourceZone: config._sourceZone,
      _filter: config._filter,
      minCards: config.minCards,
      maxCards: config.dynamicMaxCards ? config.dynamicMaxCards(state) : config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
      canConfirm: config.dynamicCanConfirm
        ? (selectedCards: readonly CardInstance[]) => config.dynamicCanConfirm!(state, selectedCards)
        : config.canConfirm,
    }),
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
