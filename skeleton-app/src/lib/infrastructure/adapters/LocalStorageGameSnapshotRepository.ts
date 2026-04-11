/**
 * LocalStorageGameSnapshotRepository - ゲーム状態の localStorage 永続化
 *
 * @architecture レイヤー間依存ルール - インフラ層（Adapter）
 * - ROLE: IGameSnapshotRepository の localStorage 実装
 * - ALLOWED: アプリ層の Port インターフェースへの依存
 * - FORBIDDEN: プレゼン層への依存
 *
 * @module infrastructure/adapters/LocalStorageGameSnapshotRepository
 */

import type { IGameSnapshotRepository, SavedGameState } from "$lib/application/ports/IGameSnapshotRepository";
import type { GameSnapshot } from "$lib/domain/models/GameState";

const STORAGE_KEY = "ygo_saved_game";

export class LocalStorageGameSnapshotRepository implements IGameSnapshotRepository {
  save(deckId: string, snapshot: GameSnapshot): void {
    const data: SavedGameState = { version: 1, deckId, snapshot };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  load(): SavedGameState | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as SavedGameState;
      if (parsed.version !== 1) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  hasSavedState(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
}
