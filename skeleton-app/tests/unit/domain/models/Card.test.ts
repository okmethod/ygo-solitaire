import { describe, it, expect } from "vitest";
import { isCardData, isMonsterCard, isSpellCard, isTrapCard } from "$lib/domain/models/Card";
import type { CardData } from "$lib/domain/models/Card";

/**
 * Card Type Guard Tests
 *
 * TEST STRATEGY: 型ガード関数は境界値と代表的な正常系のみテスト。
 * 実装の裏返しテスト（全プロパティの組み合わせ）は避け、実用的なケースに絞る。
 */

describe("isCardData (T026)", () => {
  it("should return true for valid CardData - all types", () => {
    const monsterCard: CardData = { id: 33396948, type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, type: "trap", frameType: "trap" };

    expect(isCardData(monsterCard)).toBe(true);
    expect(isCardData(spellCard)).toBe(true);
    expect(isCardData(trapCard)).toBe(true);
  });

  it("should return false for null or undefined", () => {
    expect(isCardData(null)).toBe(false);
    expect(isCardData(undefined)).toBe(false);
  });

  it("should return false for non-object primitives", () => {
    expect(isCardData("string")).toBe(false);
    expect(isCardData(123)).toBe(false);
    expect(isCardData(true)).toBe(false);
  });

  it("should return false for missing required properties", () => {
    expect(isCardData({ type: "monster" })).toBe(false); // missing id
    expect(isCardData({ id: 33396948 })).toBe(false); // missing type
  });

  it("should return false for invalid property types", () => {
    expect(isCardData({ id: "33396948", type: "monster" })).toBe(false); // id should be number
    expect(isCardData({ id: 33396948, type: "invalid-type" })).toBe(false); // invalid type value
    expect(isCardData({ id: 33396948, type: "monster", frameType: 123 })).toBe(false); // frameType should be string
  });
});

describe("isMonsterCard (T027)", () => {
  it("should distinguish monster cards from other types", () => {
    const monsterCard: CardData = { id: 33396948, type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, type: "trap", frameType: "trap" };

    expect(isMonsterCard(monsterCard)).toBe(true);
    expect(isMonsterCard(spellCard)).toBe(false);
    expect(isMonsterCard(trapCard)).toBe(false);
  });
});

describe("isSpellCard (T027)", () => {
  it("should distinguish spell cards from other types", () => {
    const monsterCard: CardData = { id: 33396948, type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, type: "trap", frameType: "trap" };

    expect(isSpellCard(spellCard)).toBe(true);
    expect(isSpellCard(monsterCard)).toBe(false);
    expect(isSpellCard(trapCard)).toBe(false);
  });
});

describe("isTrapCard (T027)", () => {
  it("should distinguish trap cards from other types", () => {
    const monsterCard: CardData = { id: 33396948, type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, type: "trap", frameType: "trap" };

    expect(isTrapCard(trapCard)).toBe(true);
    expect(isTrapCard(monsterCard)).toBe(false);
    expect(isTrapCard(spellCard)).toBe(false);
  });
});
