/**
 * derivedStores - ゲーム状態の派生ストア
 *
 * gameStateStore の変更を監視し、派生したread-only値を提供する。
 *
 * @module application/stores/derivedStores
 */

import { derived } from "svelte/store";
import { gameStateStore } from "./gameStateStore";

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

/** 手札の CardInstance 配列 */
export const handCardInstances = derived(gameStateStore, ($state) => $state.space.hand);

/** フィールドの CardInstance 配列 */
export const fieldCardInstances = derived(gameStateStore, ($state) => [
  ...$state.space.mainMonsterZone,
  ...$state.space.spellTrapZone,
  ...$state.space.fieldZone,
]);

/** 墓地の CardInstance 配列 */
export const graveyardCardInstances = derived(gameStateStore, ($state) => $state.space.graveyard);

/** 除外ゾーンの CardInstance 配列 */
export const banishedCardInstances = derived(gameStateStore, ($state) => $state.space.banished);
