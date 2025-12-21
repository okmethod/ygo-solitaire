/**
 * arrayUtils.test.ts
 *
 * shuffleArray<T>() ユーティリティ関数のユニットテスト
 *
 * テストケース:
 * 1. 配列の長さが変わらないこと
 * 2. 元の配列の要素がすべて含まれていること
 * 3. ランダム性の検証（複数回実行で異なる結果）
 * 4. 不変性の保証（元の配列が変更されないこと）
 */

import { describe, it, expect } from "vitest";
import { shuffleArray } from "$lib/shared/utils/arrayUtils";

describe("shuffleArray", () => {
  it("should preserve array length", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(original);

    expect(shuffled).toHaveLength(original.length);
  });

  it("should contain all original elements", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(original);

    // すべての元の要素が含まれていることを確認
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it("should produce different orders on multiple calls (randomness check)", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results: string[] = [];

    // 10回シャッフルして、異なる結果が得られることを確認
    for (let i = 0; i < 10; i++) {
      const shuffled = shuffleArray(original);
      results.push(JSON.stringify(shuffled));
    }

    // 少なくとも5回以上は異なる順序になるはず（統計的に妥当）
    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBeGreaterThanOrEqual(5);
  });

  it("should not mutate the original array (immutability)", () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];

    shuffleArray(original);

    // 元の配列が変更されていないことを確認
    expect(original).toEqual(originalCopy);
  });

  it("should handle empty arrays", () => {
    const empty: number[] = [];
    const shuffled = shuffleArray(empty);

    expect(shuffled).toEqual([]);
  });

  it("should handle single-element arrays", () => {
    const single = [42];
    const shuffled = shuffleArray(single);

    expect(shuffled).toEqual([42]);
  });

  it("should work with different data types", () => {
    const strings = ["a", "b", "c", "d", "e"];
    const shuffledStrings = shuffleArray(strings);

    expect(shuffledStrings).toHaveLength(5);
    expect(shuffledStrings.sort()).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("should work with complex objects", () => {
    interface Card {
      id: number;
      name: string;
    }

    const cards: Card[] = [
      { id: 1, name: "Card 1" },
      { id: 2, name: "Card 2" },
      { id: 3, name: "Card 3" },
    ];

    const shuffled = shuffleArray(cards);

    expect(shuffled).toHaveLength(3);
    // すべてのカードが含まれていることを確認
    expect(shuffled.map((c) => c.id).sort()).toEqual([1, 2, 3]);
  });
});
