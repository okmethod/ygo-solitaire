/**
 * derivedStores - ゲーム状態の派生ストア
 *
 * gameStateStore の変更を監視し、派生したread-only値を提供する。
 *
 * @module application/stores/derivedStores
 */

import { derived } from "svelte/store";
import { gameStateStore } from "./gameStateStore";
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";

/** 現在のゲームフェーズ */
export const currentPhase = derived(gameStateStore, ($state) => $state.phase);

/** 現在のターン数 */
export const currentTurn = derived(gameStateStore, ($state) => $state.turn);

/** プレイヤーのライフポイント */
export const playerLP = derived(gameStateStore, ($state) => $state.lp.player);

/** 相手のライフポイント */
export const opponentLP = derived(gameStateStore, ($state) => $state.lp.opponent);

/** 手札の枚数 */
export const handCardCount = derived(gameStateStore, ($state) => $state.zones.hand.length);

/** デッキの枚数 */
export const deckCardCount = derived(gameStateStore, ($state) => $state.zones.deck.length);

/** 墓地の枚数 */
export const graveyardCardCount = derived(gameStateStore, ($state) => $state.zones.graveyard.length);

/** フィールド（メインモンスターゾーン・魔法罠ゾーン・フィールドゾーン）の枚数 */
export const fieldCardCount = derived(
  gameStateStore,
  ($state) => $state.zones.mainMonsterZone.length + $state.zones.spellTrapZone.length + $state.zones.fieldZone.length,
);

/** ゲーム結果（自動判定） */
export const gameResult = derived(gameStateStore, ($state) => {
  // すでにゲームが終了しているなら結果を返す
  if ($state.result.isGameOver) {
    return $state.result;
  }

  // 未判定なら自動的にチェック
  return checkVictoryConditions($state);
});

/** デッキが空かどうか */
export const isDeckEmpty = derived(gameStateStore, ($state) => $state.zones.deck.length === 0);

/** 手札が空かどうか */
export const isHandEmpty = derived(gameStateStore, ($state) => $state.zones.hand.length === 0);

/** チェーンスタックのサイズ */
export const chainStackSize = derived(gameStateStore, ($state) => $state.chainStack.length);
