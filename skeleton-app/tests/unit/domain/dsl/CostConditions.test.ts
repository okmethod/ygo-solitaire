import { describe, it, expect } from "vitest";
import {
  checkCondition,
  getRegisteredConditionNames,
  isConditionRegistered,
} from "$lib/domain/dsl/registries/ConditionRegistry";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";

/**
 * CostConditions Tests - コスト関連条件のテスト
 *
 * TEST STRATEGY:
 * - HAND_COUNT_EXCLUDING_SELF 条件が正しく判定されること
 * - GRAVEYARD_HAS_SPELL 条件が正しく判定されること
 * - DECK_HAS_CARD 条件が正しく判定されること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

const createMockCardInstance = (cardId: number = 12345): CardInstance => ({
  instanceId: "test-instance-id",
  id: cardId,
  jaName: "テストカード",
  type: "spell",
  frameType: "spell",
  location: "hand",
});

const createMockGameState = (options: {
  handCount?: number;
  graveyardSpellCount?: number;
  deckFieldSpellCount?: number;
}): GameSnapshot => {
  const handCards = Array(options.handCount ?? 0)
    .fill(null)
    .map((_, i) => ({
      instanceId: `hand-card-${i}`,
      id: i + 100,
      jaName: `手札カード${i}`,
      type: "monster" as const,
      frameType: "normal" as const,
      location: "hand" as const,
    }));

  const graveyardSpells = Array(options.graveyardSpellCount ?? 0)
    .fill(null)
    .map((_, i) => ({
      instanceId: `graveyard-spell-${i}`,
      id: i + 200,
      jaName: `墓地魔法${i}`,
      type: "spell" as const,
      frameType: "spell" as const,
      location: "graveyard" as const,
    }));

  const deckFieldSpells = Array(options.deckFieldSpellCount ?? 0)
    .fill(null)
    .map((_, i) => ({
      instanceId: `deck-field-spell-${i}`,
      id: i + 300,
      jaName: `フィールド魔法${i}`,
      type: "spell" as const,
      frameType: "spell" as const,
      spellType: "field" as const,
      location: "mainDeck" as const,
    }));

  return {
    phase: "main1",
    turn: 1,
    lp: { player: 8000, opponent: 8000 },
    space: {
      mainDeck: deckFieldSpells,
      hand: handCards,
      extraDeck: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: graveyardSpells,
      banished: [],
    },
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set<number>(),
    queuedEndPhaseEffectIds: [],
  };
};

// =============================================================================
// HAND_COUNT_EXCLUDING_SELF 条件のテスト
// =============================================================================

describe("ConditionRegistry - HAND_COUNT_EXCLUDING_SELF", () => {
  it("手札が必要枚数以上ある場合は成功を返す", () => {
    const state = createMockGameState({ handCount: 3 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("HAND_COUNT_EXCLUDING_SELF", state, sourceInstance, {
      minCount: 2,
    });

    expect(result.isValid).toBe(true);
  });

  it("手札がちょうど必要枚数の場合は成功を返す", () => {
    // sourceInstance.location === "hand" のため、手札カウントから1引かれる
    // 3枚 - 1 = 2枚 で minCount: 2 を満たす
    const state = createMockGameState({ handCount: 3 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("HAND_COUNT_EXCLUDING_SELF", state, sourceInstance, {
      minCount: 2,
    });

    expect(result.isValid).toBe(true);
  });

  it("手札が不足している場合は失敗を返す", () => {
    const state = createMockGameState({ handCount: 1 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("HAND_COUNT_EXCLUDING_SELF", state, sourceInstance, {
      minCount: 2,
    });

    expect(result.isValid).toBe(false);
  });

  it("minCount引数が無効な場合は失敗を返す", () => {
    const state = createMockGameState({ handCount: 3 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("HAND_COUNT_EXCLUDING_SELF", state, sourceInstance, {});

    expect(result.isValid).toBe(false);
  });

  it("isConditionRegistered で登録状態をチェックできる", () => {
    expect(isConditionRegistered("HAND_COUNT_EXCLUDING_SELF")).toBe(true);
  });
});

// =============================================================================
// GRAVEYARD_HAS_SPELL 条件のテスト
// =============================================================================

describe("ConditionRegistry - GRAVEYARD_HAS_SPELL", () => {
  it("墓地に魔法カードがある場合は成功を返す", () => {
    const state = createMockGameState({ graveyardSpellCount: 2 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("GRAVEYARD_HAS_SPELL", state, sourceInstance, {
      minCount: 1,
    });

    expect(result.isValid).toBe(true);
  });

  it("墓地に魔法カードがちょうど必要枚数の場合は成功を返す", () => {
    const state = createMockGameState({ graveyardSpellCount: 1 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("GRAVEYARD_HAS_SPELL", state, sourceInstance, {
      minCount: 1,
    });

    expect(result.isValid).toBe(true);
  });

  it("墓地に魔法カードが不足している場合は失敗を返す", () => {
    const state = createMockGameState({ graveyardSpellCount: 0 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("GRAVEYARD_HAS_SPELL", state, sourceInstance, {
      minCount: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it("minCountがない場合はデフォルト1として判定する", () => {
    const state = createMockGameState({ graveyardSpellCount: 1 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("GRAVEYARD_HAS_SPELL", state, sourceInstance, {});

    expect(result.isValid).toBe(true);
  });

  it("isConditionRegistered で登録状態をチェックできる", () => {
    expect(isConditionRegistered("GRAVEYARD_HAS_SPELL")).toBe(true);
  });
});

// =============================================================================
// DECK_HAS_CARD 条件のテスト
// =============================================================================

describe("ConditionRegistry - DECK_HAS_CARD", () => {
  it("デッキに条件に合うカードがある場合は成功を返す", () => {
    const state = createMockGameState({ deckFieldSpellCount: 1 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("DECK_HAS_CARD", state, sourceInstance, {
      filterType: "spell",
      filterSpellType: "field",
      minCount: 1,
    });

    expect(result.isValid).toBe(true);
  });

  it("デッキに条件に合うカードがない場合は失敗を返す", () => {
    const state = createMockGameState({ deckFieldSpellCount: 0 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("DECK_HAS_CARD", state, sourceInstance, {
      filterType: "spell",
      filterSpellType: "field",
      minCount: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it("filterType が無い場合は失敗を返す", () => {
    const state = createMockGameState({ deckFieldSpellCount: 1 });
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("DECK_HAS_CARD", state, sourceInstance, {
      minCount: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it("isConditionRegistered で登録状態をチェックできる", () => {
    expect(isConditionRegistered("DECK_HAS_CARD")).toBe(true);
  });

  it("getRegisteredConditionNames で登録済み条件名一覧を取得できる", () => {
    const names = getRegisteredConditionNames();

    expect(names).toContain("HAND_COUNT_EXCLUDING_SELF");
    expect(names).toContain("GRAVEYARD_HAS_SPELL");
    expect(names).toContain("DECK_HAS_CARD");
  });
});
