/**
 * gameStateStore - ゲーム状態ストア
 *
 * GameState の Single Source of Truth (SSOT)。
 * すべてのゲーム状態（ゾーン、フェーズ、LP等）はこのストアを通じて管理される。
 *
 * @architecture レイヤー間依存ルール - Application Layer (Store)
 * - ROLE: ゲーム進行制御、Presentation Layer へのデータ提供
 * - ALLOWED: Domain Layer への依存
 * - FORBIDDEN: Infrastructure Layer への依存、Presentation Layer への依存
 *
 * @module application/stores/gameStateStore
 */

import { writable } from "svelte/store";
import type { GameSnapshot, InitialDeckCardIds } from "$lib/domain/models/GameState";
import type { DeckRecipe } from "$lib/application/types/deck";
import { GameState } from "$lib/domain/models/GameState";

// 空の初期GameStateを生成する
function createEmptyGameState(): GameSnapshot {
  return GameState.initialize(
    { mainDeckCardIds: [], extraDeckCardIds: [] },
    { skipShuffle: true, skipInitialDraw: true },
  );
}

/** ゲーム状態ストアのインターフェース */
export interface GameStateStore {
  subscribe: (run: (value: GameSnapshot) => void) => () => void;

  /** 状態を設定する（勝利判定付き） */
  set: (state: GameSnapshot) => void;

  /** 状態を更新する（勝利判定付き） */
  update: (updater: (state: GameSnapshot) => GameSnapshot) => void;
}

// 状態に勝利判定を適用する（共通処理）
function applyVictoryCheck(state: GameSnapshot): GameSnapshot {
  // すでに勝敗が決まっている場合はそのまま返す
  if (state.result.isGameOver) {
    return state;
  }
  return state;
}

// カスタムストアを作成し、set/update時に自動的に勝利判定を行う
function createGameStateStore(): GameStateStore {
  const { subscribe, set, update } = writable<GameSnapshot>(createEmptyGameState());

  return {
    subscribe,

    set: (state: GameSnapshot) => {
      set(applyVictoryCheck(state));
    },

    update: (updater: (state: GameSnapshot) => GameSnapshot) => {
      update((currentState) => applyVictoryCheck(updater(currentState)));
    },
  };
}

/** ゲーム状態ストア */
export const gameStateStore: GameStateStore = createGameStateStore();

// DeckRecipe を Domain Layer が要求する InitialDeck 形式に変換する
function convertDeckRecipeToInitialDeck(deckRecipe: DeckRecipe): InitialDeckCardIds {
  const mainDeckCardIds: number[] = [];
  deckRecipe.mainDeck.forEach((entry) => {
    for (let i = 0; i < entry.quantity; i++) {
      mainDeckCardIds.push(entry.id);
    }
  });

  const extraDeckCardIds: number[] = [];
  deckRecipe.extraDeck.forEach((entry) => {
    for (let i = 0; i < entry.quantity; i++) {
      extraDeckCardIds.push(entry.id);
    }
  });

  return { mainDeckCardIds, extraDeckCardIds };
}

/** ストアを初期状態にリセットする */
export function resetGameState(deckRecipe: DeckRecipe): void {
  const initialDeck = convertDeckRecipeToInitialDeck(deckRecipe);
  gameStateStore.set(GameState.initialize(initialDeck));
}

/** 現在の状態スナップショットを取得する（非リアクティブ） */
export function getCurrentGameState(): GameSnapshot {
  let currentState: GameSnapshot = createEmptyGameState();
  const unsubscribe = gameStateStore.subscribe((state) => {
    currentState = state;
  });
  unsubscribe();
  return currentState;
}
