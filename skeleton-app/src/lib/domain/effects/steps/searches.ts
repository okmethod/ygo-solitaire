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

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

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
  sourceZone: "graveyard" | "mainDeck",
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
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // ソースゾーンのカードをフィルタリング
      const availableCards =
        sourceZone === "graveyard"
          ? currentState.space.graveyard.filter(config.filter)
          : currentState.space.mainDeck.filter((card, index) => config.filter(card, index));

      // 条件に合うカードが存在しない場合はエラー
      if (availableCards.length === 0) {
        return GameProcessing.Result.failure(currentState, `No cards available in ${sourceZone} matching the criteria`);
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards selected");
      }

      // 選択されたカードをソースゾーンから手札に移動
      let updatedSpace = currentState.space;
      for (const instanceId of selectedInstanceIds) {
        const card = GameState.Space.findCard(updatedSpace, instanceId)!;
        updatedSpace = GameState.Space.moveCard(updatedSpace, card, "hand");
      }

      // フラグで指示されている場合はシャッフル
      if (shouldShuffle) {
        updatedSpace = GameState.Space.shuffleMainDeck(updatedSpace);
      }

      const updatedState: GameSnapshot = { ...currentState, space: updatedSpace };
      const shuffleMessage = shouldShuffle ? " and shuffled" : "";
      return GameProcessing.Result.success(
        updatedState,
        `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from ${sourceZone} to hand${shuffleMessage}`,
      );
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
  return internalSearchStep(config, "mainDeck", true);
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
      _sourceZone: "mainDeck",
      _filter: (_card, index) => index !== undefined && index < config.count,
    },
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // デッキの上からN枚を取得
      const topCards = currentState.space.mainDeck.slice(0, config.count);

      // デッキに十分なカード枚数がない場合はエラー
      if (topCards.length < config.count) {
        return GameProcessing.Result.failure(
          currentState,
          `Cannot excavate ${config.count} cards. Deck has only ${topCards.length} cards.`,
        );
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards selected");
      }

      // 選択されたカードを手札に移動
      let updatedSpace = currentState.space;
      for (const instanceId of selectedInstanceIds) {
        const card = GameState.Space.findCard(updatedSpace, instanceId)!;
        updatedSpace = GameState.Space.moveCard(updatedSpace, card, "hand");
      }

      // 残りのカードはデッキに残る（シャッフルなし - 元の位置に戻る）
      const updatedState: GameSnapshot = { ...currentState, space: updatedSpace };
      return GameProcessing.Result.success(
        updatedState,
        `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from deck to hand`,
      );
    },
  };
};
