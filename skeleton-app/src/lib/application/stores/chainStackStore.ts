/**
 * chainStackStore - チェーンスタック管理ストア
 *
 * チェーンスタックの Single Source of Truth (SSOT)。
 * チェーン構築・解決の状態管理とスペルスピード判定を担当する。
 *
 * @architecture レイヤー間依存ルール - アプリ層 (Store)
 * - ROLE: チェーン進行制御
 * - ALLOWED: ドメイン層への依存
 * - FORBIDDEN: インフラ層への依存、プレゼン層への依存
 */

import { writable, get as getStoreValue } from "svelte/store";
import type { ChainBlock, ChainBlockParams } from "$lib/domain/models/Chain";

/**
 * チェーンの状態
 */
interface ChainState {
  /** チェーン構築中かどうか */
  isBuilding: boolean;

  /** チェーンスタック（LIFO で解決） */
  stack: ChainBlock[];

  /** 現在のチェーン番号（次に積まれるブロックの番号） */
  currentChainNumber: number;

  /** 最後に積まれた ChainBlock のスペルスピード */
  lastSpellSpeed: 1 | 2 | 3 | null;
}

/**
 * 初期状態を生成する
 */
function createInitialState(): ChainState {
  return {
    isBuilding: false,
    stack: [],
    currentChainNumber: 0,
    lastSpellSpeed: null,
  };
}

/**
 * チェーンスタックストアのインターフェース
 */
export interface chainStackStore {
  subscribe: (run: (value: ChainState) => void) => () => void;

  /** チェーン構築を開始する */
  startChain: () => void;

  /** ChainBlock をスタックに追加する */
  pushChainBlock: (params: ChainBlockParams) => void;

  /** チェーン構築を終了し、解決フェーズへ移行する */
  endChainBuilding: () => void;

  /** LIFO でスタックから取り出す */
  popChainBlock: () => ChainBlock | undefined;

  /** 指定のスペルスピードでチェーン可能か判定する */
  canChain: (spellSpeed: 1 | 2 | 3) => boolean;

  /** スタックが空かどうか */
  isEmpty: () => boolean;

  /** 現在のスタックサイズを取得する */
  getStackSize: () => number;

  /** 現在の状態を取得する */
  getState: () => ChainState;

  /** チェーンをリセットする */
  reset: () => void;
}

/**
 * チェーンスタックストアを生成する
 */
function createchainStackStore(): chainStackStore {
  const { subscribe, update, set } = writable<ChainState>(createInitialState());

  const store: chainStackStore = {
    subscribe,

    startChain: () => {
      update((s) => ({
        ...s,
        isBuilding: true,
        currentChainNumber: 1,
      }));
    },

    pushChainBlock: (params: ChainBlockParams) => {
      update((s) => {
        const chainBlock: ChainBlock = {
          ...params,
          chainNumber: s.currentChainNumber,
        };
        return {
          ...s,
          stack: [...s.stack, chainBlock],
          currentChainNumber: s.currentChainNumber + 1,
          lastSpellSpeed: params.spellSpeed,
        };
      });
    },

    endChainBuilding: () => {
      update((s) => ({
        ...s,
        isBuilding: false,
      }));
    },

    popChainBlock: (): ChainBlock | undefined => {
      const state = getStoreValue(store);
      if (state.stack.length === 0) return undefined;

      const block = state.stack[state.stack.length - 1];
      update((s) => ({
        ...s,
        stack: s.stack.slice(0, -1),
      }));
      return block;
    },

    canChain: (spellSpeed: 1 | 2 | 3): boolean => {
      const state = getStoreValue(store);

      // チェーン構築中でない場合、SS1 以上なら新規チェーン開始可能
      if (!state.isBuilding) {
        return spellSpeed >= 1;
      }

      // チェーン構築中の場合、前のスペルスピード以上が必要
      return spellSpeed >= (state.lastSpellSpeed ?? 1);
    },

    isEmpty: (): boolean => {
      const state = getStoreValue(store);
      return state.stack.length === 0;
    },

    getStackSize: (): number => {
      const state = getStoreValue(store);
      return state.stack.length;
    },

    getState: (): ChainState => {
      return getStoreValue(store);
    },

    reset: () => {
      set(createInitialState());
    },
  };

  return store;
}

export const chainStackStore = createchainStackStore();
