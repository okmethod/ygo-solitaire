/**
 * zonesDisplayStore - 各ゾーンのUI表示用カードデータストア
 *
 * gameStateStore の変更を監視し、各ゾーンのCardInstanceをCardDisplayDataに変換する。
 * YGOPRODeck APIからカード詳細情報を取得し、UI表示用のデータを提供する。
 *
 * @architecture レイヤー間依存ルール - Presentation Layer
 * - ROLE: ゲーム状態からUI表示用データへの変換、API連携
 * - ALLOWED: Application Layer への依存、Infrastructure Layer への依存
 * - FORBIDDEN: Domain Layer への直接依存
 *
 * @module presentation/stores/zonesDisplayStore
 */

import { derived, type Readable } from "svelte/store";
import type { CardInstance, CardDisplayData } from "$lib/presentation/types/card";
import type { GameState } from "$lib/presentation/types";
import type { ICardDataRepository } from "$lib/application/ports/ICardDataRepository";
import { getCardDataRepository } from "$lib/infrastructure/adapters/YGOProDeckCardDataRepository";
import { createCardDisplayDataList } from "$lib/application/factories/CardDisplayDataFactory";
import { gameStateStore } from "$lib/application/stores/gameStateStore";

/**
 * カードリポジトリのシングルトンインスタンス
 *
 * Presentation Layer内の他コンポーネントで使用するため公開。
 */
export const cardRepository: ICardDataRepository = getCardDataRepository();

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
        .then((apiDataList) => {
          if (!isCancelled) {
            const displayDataList = createCardDisplayDataList(apiDataList);
            set(displayDataList);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error(`[zonesDisplayStore] Failed to fetch ${zoneName} cards:`, err);
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
