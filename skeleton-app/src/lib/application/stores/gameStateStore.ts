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
import type { GameState, InitialDeckCardIds } from "$lib/domain/models/GameState";
import type { DeckRecipe } from "$lib/application/types/deck";
import { createInitialGameState } from "$lib/domain/models/GameState";
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";

// 空の初期GameStateを生成する
function createEmptyGameState(): GameState {
  return createInitialGameState(
    { mainDeckCardIds: [], extraDeckCardIds: [] },
    { skipShuffle: true, skipInitialDraw: true },
  );
}

/** ゲーム状態ストアのインターフェース */
export interface GameStateStore {
  subscribe: (run: (value: GameState) => void) => () => void;

  /** 状態を設定する（勝利判定付き） */
  set: (state: GameState) => void;

  /** 状態を更新する（勝利判定付き） */
  update: (updater: (state: GameState) => GameState) => void;
}

// 状態に勝利判定を適用する（共通処理）
function applyVictoryCheck(state: GameState): GameState {
  // すでに勝敗が決まっている場合はそのまま返す
  if (state.result.isGameOver) {
    return state;
  }

  // ゲーム開始前（turn = 0, phase = "Draw"）は勝利判定をスキップ
  if (state.turn === 0 && state.phase === "Draw") {
    return state;
  }

  // 未判定なら自動的に勝利条件をチェック
  const victoryResult = checkVictoryConditions(state);
  if (victoryResult.isGameOver) {
    return { ...state, result: victoryResult };
  }
  return state;
}

// カスタムストアを作成し、set/update時に自動的に勝利判定を行う
function createGameStateStore(): GameStateStore {
  const { subscribe, set, update } = writable<GameState>(createEmptyGameState());

  return {
    subscribe,

    set: (state: GameState) => {
      set(applyVictoryCheck(state));
    },

    update: (updater: (state: GameState) => GameState) => {
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
  gameStateStore.set(createInitialGameState(initialDeck));
}

/** 現在の状態スナップショットを取得する（非リアクティブ） */
export function getCurrentGameState(): GameState {
  let currentState: GameState = createEmptyGameState();
  const unsubscribe = gameStateStore.subscribe((state) => {
    currentState = state;
  });
  unsubscribe();
  return currentState;
}
