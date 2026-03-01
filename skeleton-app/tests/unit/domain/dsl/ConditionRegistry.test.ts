import { describe, it, expect } from "vitest";
import { checkCondition, getRegisteredConditionNames, isConditionRegistered } from "$lib/domain/effects/conditions";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";

/**
 * ConditionRegistry Tests
 *
 * TEST STRATEGY:
 * - 登録済み条件が正しく判定を行うこと
 * - 未登録条件でエラーがスローされること
 * - 条件の成功/失敗が正しく判定されること
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

const createMockGameState = (deckCount: number): GameSnapshot => ({
  turn: 1,
  phase: "main1",
  lp: { player: 8000, opponent: 8000 },
  space: {
    mainDeck: Array(deckCount).fill({
      instanceId: "deck-card",
      cardData: { id: 1, jaName: "デッキカード", type: "monster", frameType: "normal" },
    }),
    extraDeck: [],
    hand: [],
    mainMonsterZone: [],
    spellTrapZone: [],
    fieldZone: [],
    graveyard: [],
    banished: [],
  },
  result: { isGameOver: false },
  normalSummonLimit: 1,
  normalSummonUsed: 0,
  activatedCardIds: new Set(),
  queuedEndPhaseEffectIds: [],
});

// =============================================================================
// CAN_DRAW 条件のテスト
// =============================================================================

describe("ConditionRegistry - CAN_DRAW", () => {
  it("デッキに十分なカードがある場合は成功を返す", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("CAN_DRAW", state, sourceInstance, { count: 3 });

    expect(result.isValid).toBe(true);
  });

  it("デッキにちょうど必要枚数がある場合は成功を返す", () => {
    const state = createMockGameState(3);
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("CAN_DRAW", state, sourceInstance, { count: 3 });

    expect(result.isValid).toBe(true);
  });

  it("デッキが不足している場合は失敗を返す", () => {
    const state = createMockGameState(2);
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("CAN_DRAW", state, sourceInstance, { count: 3 });

    expect(result.isValid).toBe(false);
  });

  it("デッキが空の場合は失敗を返す", () => {
    const state = createMockGameState(0);
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("CAN_DRAW", state, sourceInstance, { count: 1 });

    expect(result.isValid).toBe(false);
  });

  it("count引数が無効な場合は失敗を返す", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockCardInstance();

    const result = checkCondition("CAN_DRAW", state, sourceInstance, {});

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// エラーケースのテスト
// =============================================================================

describe("ConditionRegistry - エラーケース", () => {
  it("未登録条件でエラーをスローする", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockCardInstance();

    expect(() => {
      checkCondition("UNKNOWN_CONDITION", state, sourceInstance, {});
    }).toThrow('Unknown condition "UNKNOWN_CONDITION" for card 12345. Available conditions: CAN_DRAW');
  });
});

// =============================================================================
// ユーティリティのテスト
// =============================================================================

describe("ConditionRegistry - ユーティリティ", () => {
  it("getRegisteredConditionNames で登録済み条件名一覧を取得できる", () => {
    const names = getRegisteredConditionNames();

    expect(names).toContain("CAN_DRAW");
    expect(names).toContain("HAS_COUNTER");
  });

  it("isConditionRegistered で登録状態をチェックできる", () => {
    expect(isConditionRegistered("CAN_DRAW")).toBe(true);
    expect(isConditionRegistered("HAS_COUNTER")).toBe(true);
    expect(isConditionRegistered("UNKNOWN")).toBe(false);
  });
});

// =============================================================================
// HAS_COUNTER 条件のテスト
// =============================================================================

const createMockMonsterWithCounters = (cardId: number, counterType: "spell" | "bushido", count: number): CardInstance =>
  ({
    instanceId: `monster-${cardId}`,
    id: cardId,
    jaName: "テストモンスター",
    type: "monster",
    frameType: "effect",
    location: "mainMonsterZone",
    stateOnField: {
      position: "faceUp",
      battlePosition: "attack",
      placedThisTurn: false,
      counters: count > 0 ? [{ type: counterType, count }] : [],
      activatedEffects: new Set<string>(),
    },
  }) as CardInstance;

describe("ConditionRegistry - HAS_COUNTER", () => {
  it("カウンターが十分にある場合は成功を返す", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockMonsterWithCounters(70791313, "spell", 3);

    const result = checkCondition("HAS_COUNTER", state, sourceInstance, {
      counterType: "spell",
      minCount: 3,
    });

    expect(result.isValid).toBe(true);
  });

  it("カウンターが多い場合も成功を返す", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockMonsterWithCounters(70791313, "spell", 5);

    const result = checkCondition("HAS_COUNTER", state, sourceInstance, {
      counterType: "spell",
      minCount: 3,
    });

    expect(result.isValid).toBe(true);
  });

  it("カウンターが不足している場合は失敗を返す", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockMonsterWithCounters(70791313, "spell", 2);

    const result = checkCondition("HAS_COUNTER", state, sourceInstance, {
      counterType: "spell",
      minCount: 3,
    });

    expect(result.isValid).toBe(false);
  });

  it("カウンターが0の場合は失敗を返す", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockMonsterWithCounters(70791313, "spell", 0);

    const result = checkCondition("HAS_COUNTER", state, sourceInstance, {
      counterType: "spell",
      minCount: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it("異なるタイプのカウンターでは失敗を返す", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockMonsterWithCounters(70791313, "bushido", 3);

    const result = checkCondition("HAS_COUNTER", state, sourceInstance, {
      counterType: "spell",
      minCount: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it("counterType引数が無い場合は失敗を返す", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockMonsterWithCounters(70791313, "spell", 3);

    const result = checkCondition("HAS_COUNTER", state, sourceInstance, {
      minCount: 3,
    });

    expect(result.isValid).toBe(false);
  });

  it("minCount引数が無効な場合は失敗を返す", () => {
    const state = createMockGameState(5);
    const sourceInstance = createMockMonsterWithCounters(70791313, "spell", 3);

    const result = checkCondition("HAS_COUNTER", state, sourceInstance, {
      counterType: "spell",
    });

    expect(result.isValid).toBe(false);
  });
});
