/**
 * Counter - カウンターモデル
 *
 * カードに置かれるカウンターを管理するモデル。
 * プレーンなオブジェクトとして実装し、クラス化しない。
 * （理由: CardInstance 経由で GameState に内包されるため）
 *
 * @module domain/models/Counter
 */

/** カウンタータイプ */
export type CounterType = "spell" | "bushido";

/** カウンター状態 */
export interface CounterState {
  readonly type: CounterType;
  readonly count: number;
}

/** カウンター数を取得する */
export function getCounterCount(counters: readonly CounterState[], type: CounterType): number {
  const counter = counters.find((c) => c.type === type);
  return counter?.count ?? 0;
}

/**
 * カウンターを増減する（純粋なデータ変換）
 *
 * - delta > 0: カウンターを追加
 * - delta < 0: カウンターを削除
 * - 結果が0以下になった場合は配列から削除
 */
export function updateCounters(
  counters: readonly CounterState[],
  type: CounterType,
  delta: number,
): readonly CounterState[] {
  const existingIndex = counters.findIndex((c) => c.type === type);

  if (existingIndex >= 0) {
    const existing = counters[existingIndex];
    const newCount = Math.max(0, existing.count + delta);

    if (newCount === 0) {
      // カウンターが0になった場合は配列から削除
      return [...counters.slice(0, existingIndex), ...counters.slice(existingIndex + 1)];
    }

    return [...counters.slice(0, existingIndex), { type, count: newCount }, ...counters.slice(existingIndex + 1)];
  } else if (delta > 0) {
    // 新しいカウンターを追加（delta > 0 の場合のみ）
    return [...counters, { type, count: delta }];
  }

  // 存在しないカウンターを削除しようとした場合は何もしない
  return counters;
}
