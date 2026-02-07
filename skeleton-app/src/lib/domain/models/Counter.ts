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
  return counter?.count ?? 0; // 存在しない場合は0を返す
}

/** カウンターを追加する */
export function addCounter(
  curentCounters: readonly CounterState[],
  type: CounterType,
  amount: number,
  limit?: number,
): readonly CounterState[] {
  const existingIndex = curentCounters.findIndex((c) => c.type === type);

  if (existingIndex >= 0) {
    // 既存のカウンターを更新
    const existing = curentCounters[existingIndex];
    let updatedCounters = existing.count + amount;

    // 上限チェック
    if (limit !== undefined && updatedCounters > limit) {
      updatedCounters = limit;
    }

    return [
      ...curentCounters.slice(0, existingIndex),
      { type, count: updatedCounters },
      ...curentCounters.slice(existingIndex + 1),
    ];
  } else {
    // 新しいカウンターを追加
    let updatedCounters = amount;

    // 上限チェック
    if (limit !== undefined && updatedCounters > limit) {
      updatedCounters = limit;
    }

    return [...curentCounters, { type, count: updatedCounters }];
  }
}

/** カウンターを取り除く */
export function removeCounter(
  curentCounters: readonly CounterState[],
  type: CounterType,
  amount: number,
): readonly CounterState[] {
  const existingIndex = curentCounters.findIndex((c) => c.type === type);
  if (existingIndex < 0) {
    // カウンターが存在しない場合は何もしない
    return curentCounters;
  }

  const existing = curentCounters[existingIndex];
  const updatedCounters = Math.max(0, existing.count - amount);

  if (updatedCounters === 0) {
    // カウンターが0になった場合は配列から削除
    return [...curentCounters.slice(0, existingIndex), ...curentCounters.slice(existingIndex + 1)];
  }

  return [
    ...curentCounters.slice(0, existingIndex),
    { type, count: updatedCounters },
    ...curentCounters.slice(existingIndex + 1),
  ];
}
