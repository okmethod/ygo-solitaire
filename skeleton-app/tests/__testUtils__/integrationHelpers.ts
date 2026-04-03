/**
 * インテグレーションテスト共通ヘルパー
 *
 * GameFacade + effectQueueStore を通じた本物のゲームフローを
 * テストで操作するためのユーティリティ。
 *
 * 設計方針:
 * - vi.useFakeTimers() を前提とする（各テストの beforeEach で設定）
 * - flushEffectQueue() で static/silent ステップを全完了させる
 * - resolveCardSelection() で interactive ステップを手動解決する
 */

import { vi } from "vitest";
import { get } from "svelte/store";
import type { DeckRecipe } from "$lib/application/types/deck";
import { GameFacade } from "$lib/application/GameFacade";
import { effectQueueStore } from "$lib/application/stores/effectQueueStore";
import { gameStateStore } from "$lib/application/stores/gameStateStore";

/** テスト用 DeckRecipe を生成する */
export function createScenarioDeck(cardIds: number[], extraDeckIds: number[] = []): DeckRecipe {
  return {
    name: "Scenario Test Deck",
    description: "A deck for scenario testing",
    mainDeck: cardIds.map((id) => ({ id, quantity: 1 })),
    extraDeck: extraDeckIds.map((id) => ({ id, quantity: 1 })),
  };
}

/** GameFacade を生成し、フェイクタイマーを設定する */
export function createFacade(): GameFacade {
  vi.useFakeTimers();
  return new GameFacade();
}

/** メインフェイズ1まで進める（Draw → Standby → Main1） */
export function advanceToMain1(facade: GameFacade): void {
  facade.advancePhase(); // Draw → Standby
  facade.advancePhase(); // Standby → Main1
}

/**
 * effectQueueStore の処理を全て完了させる
 *
 * static/silent レベルのステップ（自動処理）を全て実行する。
 * interactive ステップ（カード選択モーダル等）はここでは止まる。
 */
export async function flushEffectQueue(): Promise<void> {
  await vi.runAllTimersAsync();
}

/**
 * カード選択ステップ（interactive）を解決する
 *
 * flushEffectQueue() 後に effectQueueStore.cardSelectionConfig が
 * セットされている場合に呼び出す。
 * 指定した instanceId のカードを選択して処理を再開する。
 */
export async function resolveCardSelection(selectedInstanceIds: string[]): Promise<void> {
  const queueState = get(effectQueueStore);
  if (!queueState.cardSelectionConfig) {
    throw new Error(
      "resolveCardSelection: cardSelectionConfig が見つかりません。flushEffectQueue() 後に呼んでください。",
    );
  }
  queueState.cardSelectionConfig.onConfirm(selectedInstanceIds);
  await vi.runAllTimersAsync();
}

/** 現在の gameStateStore の値を取得する */
export function getState() {
  return get(gameStateStore);
}

/** cardSelectionConfig が存在するか確認する */
export function hasCardSelection(): boolean {
  return get(effectQueueStore).cardSelectionConfig !== null;
}
