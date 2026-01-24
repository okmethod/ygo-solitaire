/**
 * searches.ts - サーチ・サルベージ系ステップビルダー
 *
 * 公開関数:
 * - searchFromDeckByConditionStep: 条件指定でデッキからサーチ
 * - searchFromDeckTopStep: デッキトップを指定枚数確認してサーチ
 * - salvageFromGraveyardStep: 墓地からサルベージ
 *
 * @module domain/effects/steps/searches
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { CardInstance } from "$lib/domain/models/Card";
import { moveCard, shuffleDeck } from "$lib/domain/models/Zone";

// カードを検索して手札に加える処理の共通ステップ
const internalSearchStep = (
  config: {
    id: string;
    summary: string;
    description: string;
    filter: (card: CardInstance, index?: number) => boolean;
    minCards: number;
    maxCards: number;
    cancelable?: boolean;
  },
  sourceZone: "graveyard" | "deck",
  shouldShuffle: boolean,
): AtomicStep => {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
      _sourceZone: sourceZone,
      _filter: config.filter,
    },
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // ソースゾーンのカードをフィルタリング
      const availableCards =
        sourceZone === "graveyard"
          ? currentState.zones.graveyard.filter(config.filter)
          : currentState.zones.deck.filter((card, index) => config.filter(card, index));

      // 条件に合うカードが存在しない場合はエラー
      if (availableCards.length === 0) {
        return {
          success: false,
          updatedState: currentState,
          error: `No cards available in ${sourceZone} matching the criteria`,
        };
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return {
          success: false,
          updatedState: currentState,
          error: "No cards selected",
        };
      }

      // 選択されたカードをソースゾーンから手札に移動
      let updatedZones = currentState.zones;
      for (const instanceId of selectedInstanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, sourceZone, "hand");
      }

      // フラグで指示されている場合はシャッフル
      if (shouldShuffle) {
        updatedZones = shuffleDeck(updatedZones);
      }

      const updatedState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      const shuffleMessage = shouldShuffle ? " and shuffled" : "";
      return {
        success: true,
        updatedState,
        message: `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from ${sourceZone} to hand${shuffleMessage}`,
      };
    },
  };
};

/** 墓地から条件に合うカードを選択し、手札に加える（サルベージする）ステップ */
export const salvageFromGraveyardStep = (config: {
  id: string;
  summary: string;
  description: string;
  filter: (card: CardInstance) => boolean;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
}): AtomicStep => {
  return internalSearchStep(config, "graveyard", false);
};

/** デッキから条件に合うカードを検索し、手札に加える（サーチする）ステップ */
export const searchFromDeckByConditionStep = (config: {
  id: string;
  summary: string;
  description: string;
  filter: (card: CardInstance) => boolean;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
}): AtomicStep => {
  return internalSearchStep(config, "deck", true);
};

/** デッキの上から指定枚数を確認し、1枚を選んで手札に加えるステップ */
export const searchFromDeckTopStep = (config: {
  id: string;
  summary: string;
  description: string;
  count: number;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
}): AtomicStep => {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
      _sourceZone: "deck",
      _filter: (_card, index) => index !== undefined && index < config.count,
    },
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // デッキの上からN枚を取得
      const topCards = currentState.zones.deck.slice(0, config.count);

      // デッキに十分なカード枚数がない場合はエラー
      if (topCards.length < config.count) {
        return {
          success: false,
          updatedState: currentState,
          error: `Cannot excavate ${config.count} cards. Deck has only ${topCards.length} cards.`,
        };
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return {
          success: false,
          updatedState: currentState,
          error: "No cards selected",
        };
      }

      // 選択されたカードを手札に移動
      let updatedZones = currentState.zones;
      for (const instanceId of selectedInstanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "deck", "hand");
      }

      // 残りのカードはデッキに残る（シャッフルなし - 元の位置に戻る）
      const updatedState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      return {
        success: true,
        updatedState,
        message: `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from deck to hand`,
      };
    },
  };
};
