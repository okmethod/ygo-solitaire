/**
 * arrayUtils.ts
 *
 * 汎用的な配列操作ユーティリティ関数
 */

/**
 * Fisher-Yates (Knuth) シャッフルアルゴリズムを使用して配列をランダムにシャッフルする
 *
 * - 時間計算量: O(n)
 * - 空間計算量: O(n) (新しい配列を返すため)
 * - 元の配列は変更しない（不変性を保証）
 *
 * @template T - 配列要素の型
 * @param array - シャッフルする配列（readonly）
 * @returns シャッフルされた新しい配列
 *
 * @example
 * const deck = [1, 2, 3, 4, 5];
 * const shuffled = shuffleArray(deck);
 * // shuffled: [3, 1, 5, 2, 4] (例)
 * // deck: [1, 2, 3, 4, 5] (元の配列は変更されない)
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  // 元の配列をコピーして不変性を保証
  const shuffled = [...array];

  // Fisher-Yates (Knuth) シャッフル
  // 配列の末尾から順に、ランダムな位置の要素と入れ替える
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
