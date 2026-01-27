/**
 * cardDisplayStore - CardInstance → CardDisplayData変換ストア
 *
 * gameStateStore の変更を監視し、各ゾーンのCardInstanceをCardDisplayDataに変換する。
 * YGOPRODeck APIからカード詳細情報を取得し、UI表示用のデータを提供する。
 *
 * @module application/stores/cardDisplayStore
 */

import { derived, type Readable } from "svelte/store";
import { gameStateStore } from "./gameStateStore";
import type { ICardDataRepository } from "$lib/application/ports/ICardDataRepository";
import { getCardRepository } from "$lib/infrastructure/adapters/YGOProDeckCardRepository";
import type { CardDisplayData } from "$lib/application/types/card";
import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";

/**
 * カードリポジトリのシングルトンインスタンス
 *
 * Dependency Injection: Application Layer内の他コンポーネントで使用するため公開。
 */
export const cardRepository: ICardDataRepository = getCardRepository();

/**
 * ゾーン監視用の汎用CardDisplayDataストアを生成
 *
 * gameStateStoreの変更を監視し、YGOPRODeck APIから自動取得する。
 * キャッシュヒット時は即座に返す。エラー時は空配列を返す。
 */
function createZoneCardStore(
  zoneName: string,
  zoneSelector: (state: GameState) => readonly CardInstance[],
): Readable<CardDisplayData[]> {
  return derived(
    gameStateStore,
    ($gameState, set) => {
      const cards = zoneSelector($gameState);
      const cardIds = cards.map((c) => c.id);

      if (cardIds.length === 0) {
        set([]);
        return;
      }

      // Race Condition対策: 非同期処理中にストアが再評価された場合に備える
      let isCancelled = false;

      cardRepository
        .getCardsByIds(fetch, cardIds)
        .then((cards) => {
          if (!isCancelled) {
            set(cards);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error(`[cardDisplayStore] Failed to fetch ${zoneName} cards:`, err);
            set([]);
          }
        });

      // クリーンアップ: 非同期処理中にストアが再評価された場合にキャンセルフラグを立てる
      return () => {
        isCancelled = true;
      };
    },
    [] as CardDisplayData[],
  );
}

/** 手札のCardDisplayData配列 */
export const handCards = createZoneCardStore("hand", (state) => state.zones.hand);

/** フィールド（メインモンスターゾーン・魔法罠ゾーン・フィールドゾーン）のCardDisplayData配列 */
export const fieldCards = createZoneCardStore("field", (state) => [
  ...state.zones.mainMonsterZone,
  ...state.zones.spellTrapZone,
  ...state.zones.fieldZone,
]);

/** 墓地のCardDisplayData配列 */
export const graveyardCards = createZoneCardStore("graveyard", (state) => state.zones.graveyard);

/** 除外ゾーンのCardDisplayData配列 */
export const banishedCards = createZoneCardStore("banished", (state) => state.zones.banished);
