/**
 * gameStateStore - ゲーム状態ストア
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
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";

// 空の初期GameStateを生成する
function createEmptyGameState(): GameState {
  return createInitialGameState([]);
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

/** ストアを初期状態にリセットする */
export function resetGameState(deckCardIds: number[]): void {
  gameStateStore.set(createInitialGameState(deckCardIds));
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
