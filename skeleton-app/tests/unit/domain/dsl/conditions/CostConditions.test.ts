/**
 * コスト系条件のテスト
 */

import { describe, it, expect } from "vitest";
import { checkCondition, AtomicConditionRegistry } from "$lib/domain/dsl/conditions";
import { createSpellInstance, createFilledSpaceState } from "../../../../__testUtils__";

// ソースインスタンス（条件チェックの発動元として使用）
const sourceInstance = createSpellInstance("dummy-source");

// =============================================================================
// HAND_COUNT_EXCLUDING_SELF 条件のテスト
// =============================================================================

describe("ConditionRegistry - HAND_COUNT_EXCLUDING_SELF", () => {
  it("手札が必要枚数以上ある場合は成功を返す", () => {
    const state = createFilledSpaceState({ handCount: 3 });

    const result = checkCondition("HAND_COUNT_EXCLUDING_SELF", state, sourceInstance, {
      minCount: 2,
    });

    expect(result.isValid).toBe(true);
  });

  it("手札がちょうど必要枚数の場合は成功を返す", () => {
    // sourceInstance.location === "hand" のため、手札カウントから1引かれる
    // 3枚 - 1 = 2枚 で minCount: 2 を満たす
    const state = createFilledSpaceState({ handCount: 3 });

    const result = checkCondition("HAND_COUNT_EXCLUDING_SELF", state, sourceInstance, {
      minCount: 2,
    });

    expect(result.isValid).toBe(true);
  });

  it("手札が不足している場合は失敗を返す", () => {
    const state = createFilledSpaceState({ handCount: 1 });

    const result = checkCondition("HAND_COUNT_EXCLUDING_SELF", state, sourceInstance, {
      minCount: 2,
    });

    expect(result.isValid).toBe(false);
  });

  it("minCount引数が無効な場合は失敗を返す", () => {
    const state = createFilledSpaceState({ handCount: 3 });

    const result = checkCondition("HAND_COUNT_EXCLUDING_SELF", state, sourceInstance, {});

    expect(result.isValid).toBe(false);
  });

  it("isRegistered で登録状態をチェックできる", () => {
    expect(AtomicConditionRegistry.isRegistered("HAND_COUNT_EXCLUDING_SELF")).toBe(true);
  });
});

// =============================================================================
// GRAVEYARD_HAS_SPELL 条件のテスト
// =============================================================================

describe("ConditionRegistry - GRAVEYARD_HAS_SPELL", () => {
  it("墓地に魔法カードがある場合は成功を返す", () => {
    const state = createFilledSpaceState({ graveyardCount: 2 });

    const result = checkCondition("GRAVEYARD_HAS_SPELL", state, sourceInstance, {
      minCount: 1,
    });

    expect(result.isValid).toBe(true);
  });

  it("墓地に魔法カードがちょうど必要枚数の場合は成功を返す", () => {
    const state = createFilledSpaceState({ graveyardCount: 1 });

    const result = checkCondition("GRAVEYARD_HAS_SPELL", state, sourceInstance, {
      minCount: 1,
    });

    expect(result.isValid).toBe(true);
  });

  it("墓地に魔法カードが不足している場合は失敗を返す", () => {
    const state = createFilledSpaceState({ graveyardCount: 0 });

    const result = checkCondition("GRAVEYARD_HAS_SPELL", state, sourceInstance, {
      minCount: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it("minCountがない場合はデフォルト1として判定する", () => {
    const state = createFilledSpaceState({ graveyardCount: 1 });

    const result = checkCondition("GRAVEYARD_HAS_SPELL", state, sourceInstance, {});

    expect(result.isValid).toBe(true);
  });

  it("isRegistered で登録状態をチェックできる", () => {
    expect(AtomicConditionRegistry.isRegistered("GRAVEYARD_HAS_SPELL")).toBe(true);
  });
});

// =============================================================================
// DECK_HAS_CARD 条件のテスト
// =============================================================================

describe("ConditionRegistry - DECK_HAS_CARD", () => {
  it("デッキに条件に合うカードがある場合は成功を返す", () => {
    const state = createFilledSpaceState({ mainDeckCount: 1 });

    const result = checkCondition("DECK_HAS_CARD", state, sourceInstance, {
      filterType: "spell",
      filterSpellType: "normal", // デッキには通常魔法が入っている
      minCount: 1,
    });

    expect(result.isValid).toBe(true);
  });

  it("デッキに条件に合うカードがない場合は失敗を返す", () => {
    const state = createFilledSpaceState({ mainDeckCount: 0 });

    const result = checkCondition("DECK_HAS_CARD", state, sourceInstance, {
      filterType: "spell",
      filterSpellType: "field", // デッキにはフィールド魔法は入っていない
      minCount: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it("filterType が無い場合は失敗を返す", () => {
    const state = createFilledSpaceState({ mainDeckCount: 1 });

    const result = checkCondition("DECK_HAS_CARD", state, sourceInstance, {
      minCount: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it("isRegistered で登録状態をチェックできる", () => {
    expect(AtomicConditionRegistry.isRegistered("DECK_HAS_CARD")).toBe(true);
  });

  it("getRegisteredNames で登録済み条件名一覧を取得できる", () => {
    const names = AtomicConditionRegistry.getRegisteredNames();

    expect(names).toContain("HAND_COUNT_EXCLUDING_SELF");
    expect(names).toContain("GRAVEYARD_HAS_SPELL");
    expect(names).toContain("DECK_HAS_CARD");
  });
});
