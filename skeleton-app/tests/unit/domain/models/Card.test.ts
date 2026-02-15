import { describe, it, expect } from "vitest";
import type { CardData } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";

/**
 * Card Type Guard Tests
 *
 * TEST STRATEGY: 型ガード関数は境界値と代表的な正常系のみテスト。
 * 実装の裏返しテスト（全プロパティの組み合わせ）は避け、実用的なケースに絞る。
 */

describe("isMonsterCard", () => {
  it("should distinguish monster cards from other types", () => {
    const monsterCard: CardData = { id: 33396948, jaName: "モンスターカード", type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, jaName: "魔法カード", type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, jaName: "罠カード", type: "trap", frameType: "trap" };

    expect(Card.isMonster(monsterCard)).toBe(true);
    expect(Card.isMonster(spellCard)).toBe(false);
    expect(Card.isMonster(trapCard)).toBe(false);
  });
});

describe("isSpellCard", () => {
  it("should distinguish spell cards from other types", () => {
    const monsterCard: CardData = { id: 33396948, jaName: "モンスターカード", type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, jaName: "魔法カード", type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, jaName: "罠カード", type: "trap", frameType: "trap" };

    expect(Card.isSpell(spellCard)).toBe(true);
    expect(Card.isSpell(monsterCard)).toBe(false);
    expect(Card.isSpell(trapCard)).toBe(false);
  });
});

describe("isTrapCard", () => {
  it("should distinguish trap cards from other types", () => {
    const monsterCard: CardData = { id: 33396948, jaName: "モンスターカード", type: "monster", frameType: "normal" };
    const spellCard: CardData = { id: 55144522, jaName: "魔法カード", type: "spell", frameType: "spell" };
    const trapCard: CardData = { id: 12345678, jaName: "罠カード", type: "trap", frameType: "trap" };

    expect(Card.isTrap(trapCard)).toBe(true);
    expect(Card.isTrap(monsterCard)).toBe(false);
    expect(Card.isTrap(spellCard)).toBe(false);
  });
});
