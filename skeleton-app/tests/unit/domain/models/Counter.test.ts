/**
 * Counter モデルのユニットテスト
 *
 * @module tests/unit/domain/models/Counter.test
 */

import { describe, it, expect } from "vitest";
import { addCounter, removeCounter, getCounterCount, type CounterState } from "$lib/domain/models/Counter";

describe("Counter", () => {
  describe("addCounter", () => {
    it("空の配列にカウンターを追加できる", () => {
      const counters: readonly CounterState[] = [];
      const result = addCounter(counters, "spell", 1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: "spell", count: 1 });
    });

    it("既存のカウンターに数を追加できる", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 1 }];
      const result = addCounter(counters, "spell", 2);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: "spell", count: 3 });
    });

    it("異なる種類のカウンターを追加できる", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 2 }];
      const result = addCounter(counters, "bushido", 1);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ type: "spell", count: 2 });
      expect(result[1]).toEqual({ type: "bushido", count: 1 });
    });

    it("上限を指定した場合、上限を超えない", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 2 }];
      const result = addCounter(counters, "spell", 5, 3);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: "spell", count: 3 });
    });

    it("空の配列に上限付きで追加した場合、上限を超えない", () => {
      const counters: readonly CounterState[] = [];
      const result = addCounter(counters, "spell", 5, 3);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: "spell", count: 3 });
    });

    it("元の配列を変更しない（不変性）", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 1 }];
      const result = addCounter(counters, "spell", 1);

      expect(counters[0].count).toBe(1);
      expect(result[0].count).toBe(2);
    });
  });

  describe("removeCounter", () => {
    it("カウンターから数を取り除ける", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 3 }];
      const result = removeCounter(counters, "spell", 1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: "spell", count: 2 });
    });

    it("カウンターが0になった場合は配列から削除される", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 2 }];
      const result = removeCounter(counters, "spell", 2);

      expect(result).toHaveLength(0);
    });

    it("取り除く数が現在の数より多い場合は0になる", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 2 }];
      const result = removeCounter(counters, "spell", 5);

      expect(result).toHaveLength(0);
    });

    it("存在しないカウンタータイプを取り除こうとしても何もしない", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 2 }];
      const result = removeCounter(counters, "bushido", 1);

      expect(result).toEqual(counters);
    });

    it("複数種類のカウンターから特定の種類だけ取り除ける", () => {
      const counters: readonly CounterState[] = [
        { type: "spell", count: 3 },
        { type: "bushido", count: 2 },
      ];
      const result = removeCounter(counters, "spell", 3);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: "bushido", count: 2 });
    });

    it("元の配列を変更しない（不変性）", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 3 }];
      const result = removeCounter(counters, "spell", 1);

      expect(counters[0].count).toBe(3);
      expect(result[0].count).toBe(2);
    });
  });

  describe("getCounterCount", () => {
    it("存在するカウンターの数を取得できる", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 3 }];
      const result = getCounterCount(counters, "spell");

      expect(result).toBe(3);
    });

    it("存在しないカウンターの場合は0を返す", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 3 }];
      const result = getCounterCount(counters, "bushido");

      expect(result).toBe(0);
    });

    it("空の配列の場合は0を返す", () => {
      const counters: readonly CounterState[] = [];
      const result = getCounterCount(counters, "spell");

      expect(result).toBe(0);
    });

    it("複数種類のカウンターから特定の種類を取得できる", () => {
      const counters: readonly CounterState[] = [
        { type: "spell", count: 3 },
        { type: "bushido", count: 5 },
      ];

      expect(getCounterCount(counters, "spell")).toBe(3);
      expect(getCounterCount(counters, "bushido")).toBe(5);
    });
  });

  describe("王立魔法図書館のユースケース", () => {
    it("魔力カウンターを3個まで蓄積できる", () => {
      let counters: readonly CounterState[] = [];
      const MAX_SPELL_COUNTERS = 3;

      // 1個目
      counters = addCounter(counters, "spell", 1, MAX_SPELL_COUNTERS);
      expect(getCounterCount(counters, "spell")).toBe(1);

      // 2個目
      counters = addCounter(counters, "spell", 1, MAX_SPELL_COUNTERS);
      expect(getCounterCount(counters, "spell")).toBe(2);

      // 3個目
      counters = addCounter(counters, "spell", 1, MAX_SPELL_COUNTERS);
      expect(getCounterCount(counters, "spell")).toBe(3);

      // 4個目は上限で弾かれる
      counters = addCounter(counters, "spell", 1, MAX_SPELL_COUNTERS);
      expect(getCounterCount(counters, "spell")).toBe(3);
    });

    it("魔力カウンターを3個消費してドローできる", () => {
      let counters: readonly CounterState[] = [{ type: "spell", count: 3 }];
      const REQUIRED_COUNTERS = 3;

      // 発動条件チェック
      expect(getCounterCount(counters, "spell") >= REQUIRED_COUNTERS).toBe(true);

      // カウンター消費
      counters = removeCounter(counters, "spell", REQUIRED_COUNTERS);
      expect(getCounterCount(counters, "spell")).toBe(0);
    });

    it("魔力カウンターが2個以下の場合は発動条件を満たさない", () => {
      const counters: readonly CounterState[] = [{ type: "spell", count: 2 }];
      const REQUIRED_COUNTERS = 3;

      expect(getCounterCount(counters, "spell") >= REQUIRED_COUNTERS).toBe(false);
    });
  });
});
