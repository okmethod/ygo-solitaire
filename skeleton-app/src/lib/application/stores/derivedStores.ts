/**
 * derivedStores - ゲーム状態の派生ストア
 *
 * gameStateStore の変更を監視し、派生したread-only値を提供する。
 *
 * @module application/stores/derivedStores
 */

import { derived } from "svelte/store";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { toInstanceRef, toStateOnField } from "$lib/application/factories/CardInstanceFactory";

/** 現在のゲームフェーズ */
export const currentPhase = derived(gameStateStore, ($state) => $state.phase);

/** 現在のターン数 */
export const currentTurn = derived(gameStateStore, ($state) => $state.turn);

/** プレイヤーのライフポイント */
export const playerLP = derived(gameStateStore, ($state) => $state.lp.player);

/** 相手のライフポイント */
export const opponentLP = derived(gameStateStore, ($state) => $state.lp.opponent);

/** 手札の枚数 */
export const handCardCount = derived(gameStateStore, ($state) => $state.space.hand.length);

/** デッキの枚数 */
export const deckCardCount = derived(gameStateStore, ($state) => $state.space.mainDeck.length);

/** 墓地の枚数 */
export const graveyardCardCount = derived(gameStateStore, ($state) => $state.space.graveyard.length);

/** フィールド（メインモンスターゾーン・魔法罠ゾーン・フィールドゾーン）の枚数 */
export const fieldCardCount = derived(
  gameStateStore,
  ($state) => $state.space.mainMonsterZone.length + $state.space.spellTrapZone.length + $state.space.fieldZone.length,
);

/** ゲーム結果 */
export const gameResult = derived(gameStateStore, ($state) => $state.result);

/** デッキが空かどうか */
export const isDeckEmpty = derived(gameStateStore, ($state) => $state.space.mainDeck.length === 0);

/** 手札が空かどうか */
export const isHandEmpty = derived(gameStateStore, ($state) => $state.space.hand.length === 0);

/** 手札の CardInstanceRef 配列 */
export const handCardRefs = derived(gameStateStore, ($state) => $state.space.hand.map(toInstanceRef));

/** 墓地の CardInstanceRef 配列 */
export const graveyardCardRefs = derived(gameStateStore, ($state) => $state.space.graveyard.map(toInstanceRef));

/** 除外ゾーンの CardInstanceRef 配列 */
export const banishedCardRefs = derived(gameStateStore, ($state) => $state.space.banished.map(toInstanceRef));

/** モンスターゾーンの CardDisplayStateOnField 配列 */
export const monsterZoneDisplayInstances = derived(gameStateStore, ($state) =>
  $state.space.mainMonsterZone.map(toStateOnField),
);

/** 魔法・罠ゾーンの CardDisplayStateOnField 配列 */
export const spellTrapZoneDisplayInstances = derived(gameStateStore, ($state) =>
  $state.space.spellTrapZone.map(toStateOnField),
);

/** フィールドゾーンの CardDisplayStateOnField 配列 */
export const fieldZoneDisplayInstances = derived(gameStateStore, ($state) =>
  $state.space.fieldZone.map(toStateOnField),
);
