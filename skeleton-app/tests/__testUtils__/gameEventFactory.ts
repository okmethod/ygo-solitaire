/**
 * GameEvent テスト用ファクトリ
 *
 * テストで使用する GameEvent オブジェクトの生成ヘルパー。
 */

import type { EventType, GameEvent } from "$lib/domain/models/GameProcessing/GameEvent";

/**
 * テスト用 GameEvent を生成する
 *
 * @param type イベント種別
 * @param sourceCardId 発生源カードID（デフォルト: 0）
 * @param sourceInstanceId 発生源カードインスタンスID（デフォルト: "card-1"）
 */
export function createGameEvent(
  type: EventType,
  sourceInstanceId: string = "card-1",
  sourceCardId: number = 0,
): GameEvent {
  return { type, sourceCardId, sourceInstanceId };
}
