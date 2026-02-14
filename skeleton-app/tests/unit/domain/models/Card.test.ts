import { describe, it, expect } from "vitest";
import { isMonsterCard, isSpellCard, isTrapCard } from "$lib/domain/models/CardOld";
import type { CardData } from "$lib/domain/models/CardOld";

/**
 * Card Type Guard Tests
 *
 * TEST STRATEGY: 型ガード関数は境界値と代表的な正常系のみテスト。
 * 実装の裏返しテスト（全プロパティの組み合わせ）は避け、実用的なケースに絞る。
 */

describe("isMonsterCard (T027)", () => {
  it("should distinguish monster cards from other types", () => {
    const monsterCard: CardData = { id: 33396948, jaName: "モンスターカード", type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, jaName: "魔法カード", type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, jaName: "罠カード", type: "trap", frameType: "trap" };

    expect(isMonsterCard(monsterCard)).toBe(true);
    expect(isMonsterCard(spellCard)).toBe(false);
    expect(isMonsterCard(trapCard)).toBe(false);
  });
});

describe("isSpellCard (T027)", () => {
  it("should distinguish spell cards from other types", () => {
    const monsterCard: CardData = { id: 33396948, jaName: "モンスターカード", type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, jaName: "魔法カード", type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, jaName: "罠カード", type: "trap", frameType: "trap" };

    expect(isSpellCard(spellCard)).toBe(true);
    expect(isSpellCard(monsterCard)).toBe(false);
    expect(isSpellCard(trapCard)).toBe(false);
  });
});

describe("isTrapCard (T027)", () => {
  it("should distinguish trap cards from other types", () => {
    const monsterCard: CardData = { id: 33396948, jaName: "モンスターカード", type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, jaName: "魔法カード", type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, jaName: "罠カード", type: "trap", frameType: "trap" };

    expect(isTrapCard(trapCard)).toBe(true);
    expect(isTrapCard(monsterCard)).toBe(false);
    expect(isTrapCard(spellCard)).toBe(false);
  });
});
