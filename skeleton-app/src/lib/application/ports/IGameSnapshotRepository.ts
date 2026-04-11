/**
 * IGameSnapshotRepository - ゲーム状態永続化の Port インターフェース
 *
 * @architecture レイヤー間依存ルール - アプリ層（Port）
 * - ROLE: ゲーム状態の保存・復元の抽象化
 * - ALLOWED: ドメイン層への依存
 * - FORBIDDEN: インフラ層への依存、プレゼン層への依存
 *
 * @module application/ports/IGameSnapshotRepository
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";

/** ゲーム状態を保存するデータ構造 */
export interface SavedGameState {
  /** デッキID */
  deckId: string;
  /** シリアライズ済みゲーム状態 */
  snapshot: GameSnapshot;
  /** 保存データのスキーマバージョン */
  version: 1;
}

export interface IGameSnapshotRepository {
  save(deckId: string, snapshot: GameSnapshot): void;
  load(): SavedGameState | null;
  clear(): void;
  hasSavedState(): boolean;
}
