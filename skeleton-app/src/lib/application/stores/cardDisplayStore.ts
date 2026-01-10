/**
 * cardDisplayStore - CardInstance → CardDisplayData変換ストア
 *
 * gameStateStoreの変更を監視し、各ゾーンのCardInstanceをCardDisplayDataに変換する。
 * YGOPRODeck APIからカード詳細情報を取得し、UI表示用のデータを提供する。
 *
 * @module application/stores/cardDisplayStore
 */

import { derived, type Readable } from "svelte/store";
import { gameStateStore } from "./gameStateStore";
import type { ICardDataRepository } from "$lib/application/ports/ICardDataRepository";
import { getCardRepository } from "$lib/infrastructure/adapters/YGOProDeckCardRepository";
import type { CardDisplayData } from "$lib/application/types/card";

// Dependency Injection: Singleton Repository インスタンスを取得
// Export for use in other Application Layer components (e.g., CardSelectionModal)
export const cardRepository: ICardDataRepository = getCardRepository();

/**
 * 手札のCardDisplayData配列を提供
 *
 * gameStateStoreの変更を監視し、自動的にYGOPRODeck APIから取得。
 * キャッシュヒット時は即座に返す。
 * エラー時は空配列を返す（placeholder表示）。
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { handCards } from '$lib/application/stores/cardDisplayStore';
 * </script>
 * <div>Hand: {$handCards.length} cards</div>
 * {#each $handCards as card (card.id)}
 *   <Card {card} />
 * {/each}
 * ```
 */
export const handCards: Readable<CardDisplayData[]> = derived(
  gameStateStore,
  ($gameState, set) => {
    const cardIds = $gameState.zones.hand.map((c) => c.id); // CardInstance extends CardData

    if (cardIds.length === 0) {
      set([]);
      return;
    }

    cardRepository
      .getCardsByIds(cardIds)
      .then((cards) => {
        set(cards);
      })
      .catch((err) => {
        console.error("[cardDisplayStore] Failed to fetch hand cards:", err);
        set([]); // エラー時は空配列（placeholder表示）
      });
  },
  [] as CardDisplayData[], // 初期値
);

/**
 * フィールドのCardDisplayData配列を提供
 *
 * gameStateStoreのzones.mainMonsterZone + zones.spellTrapZone + zones.fieldZoneを監視。
 * すべてのフィールド上のカードを含む（T031）。
 */
export const fieldCards: Readable<CardDisplayData[]> = derived(
  gameStateStore,
  ($gameState, set) => {
    const fieldCardsAll = [
      ...$gameState.zones.mainMonsterZone,
      ...$gameState.zones.spellTrapZone,
      ...$gameState.zones.fieldZone,
    ];
    const cardIds = fieldCardsAll.map((c) => c.id); // CardInstance extends CardData

    if (cardIds.length === 0) {
      set([]);
      return;
    }

    // Flag to prevent stale data from being set (Race Condition対策)
    let isCancelled = false;

    cardRepository
      .getCardsByIds(cardIds)
      .then((cards) => {
        if (!isCancelled) {
          set(cards);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("[cardDisplayStore] Failed to fetch field cards:", err);
          set([]);
        }
      });

    // Cleanup function: called when derived re-evaluates or unsubscribes
    return () => {
      isCancelled = true;
    };
  },
  [] as CardDisplayData[],
);

/**
 * 墓地のCardDisplayData配列を提供
 *
 * gameStateStoreのzones.graveyardを監視。
 */
export const graveyardCards: Readable<CardDisplayData[]> = derived(
  gameStateStore,
  ($gameState, set) => {
    const cardIds = $gameState.zones.graveyard.map((c) => c.id); // CardInstance extends CardData

    if (cardIds.length === 0) {
      set([]);
      return;
    }

    cardRepository
      .getCardsByIds(cardIds)
      .then((cards) => {
        set(cards);
      })
      .catch((err) => {
        console.error("[cardDisplayStore] Failed to fetch graveyard cards:", err);
        set([]);
      });
  },
  [] as CardDisplayData[],
);

/**
 * 除外ゾーンのCardDisplayData配列を提供
 *
 * gameStateStoreのzones.banishedを監視。
 */
export const banishedCards: Readable<CardDisplayData[]> = derived(
  gameStateStore,
  ($gameState, set) => {
    const cardIds = $gameState.zones.banished.map((c) => c.id); // CardInstance extends CardData

    if (cardIds.length === 0) {
      set([]);
      return;
    }

    cardRepository
      .getCardsByIds(cardIds)
      .then((cards) => {
        set(cards);
      })
      .catch((err) => {
        console.error("[cardDisplayStore] Failed to fetch banished cards:", err);
        set([]);
      });
  },
  [] as CardDisplayData[],
);
