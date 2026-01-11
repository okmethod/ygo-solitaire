/**
 * gameStateStore - メインゲーム状態ストア
 *
 * GameState の Single Source of Truth (SSOT)。
 * すべてのゲーム状態（ゾーン、フェーズ、LP等）はこのストアを通じて管理される。
 *
 * IMPORTANT REMINDER: Application Layer - レイヤー間依存ルール
 * - Application Layer は Domain Layer に依存できる
 * - Presentation Layer は Application Layer（GameFacade、Stores）のみに依存する
 * - Presentation Layer は Domain Layer に直接依存してはいけない
 *
 * @module application/stores/gameStateStore
 */

import { writable } from "svelte/store";
import type { GameState } from "$lib/domain/models/GameState";
import { createInitialGameState } from "$lib/domain/models/GameState";

// 空の初期GameStateを生成する
function createEmptyGameState(): GameState {
  return createInitialGameState([]);
}

/** メインゲーム状態ストア（writable） */
export const gameStateStore = writable<GameState>(createEmptyGameState());

/** ストアを初期状態にリセットする */
export function resetGameState(deckCardIds: number[]): void {
  gameStateStore.set(createInitialGameState(deckCardIds));
}

/** 現在の状態スナップショットを取得する（非リアクティブ） */
export function getCurrentState(): GameState {
  let currentState: GameState = createEmptyGameState();
  const unsubscribe = gameStateStore.subscribe((state) => {
    currentState = state;
  });
  unsubscribe();
  return currentState;
}
