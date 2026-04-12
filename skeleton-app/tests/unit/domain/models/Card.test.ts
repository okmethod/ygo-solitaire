import { describe, it, expect } from "vitest";
import type { CardData } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import { TEST_CARD_IDS } from "../../../__testUtils__";

/**
 * Card Type Guard Tests
 *
 * TEST STRATEGY: 型ガード関数は境界値と代表的な正常系のみテスト。
 * 実装の裏返しテスト（全プロパティの組み合わせ）は避け、実用的なケースに絞る。
 */

describe("isMonsterCard", () => {
  it("should distinguish monster cards from other types", () => {
    const monsterCard: CardData = {
      id: TEST_CARD_IDS.DUMMY,
      jaName: "モンスターカード",
      type: "monster",
      frameType: "normal",
      edition: "latest",
    };
    const spellCard: CardData = {
      id: TEST_CARD_IDS.SPELL_NORMAL,
      jaName: "魔法カード",
      type: "spell",
      frameType: "spell",
      edition: "latest",
    };
    const trapCard: CardData = {
      id: TEST_CARD_IDS.TRAP_NORMAL,
      jaName: "罠カード",
      type: "trap",
      frameType: "trap",
      edition: "latest",
    };

    expect(Card.isMonster(monsterCard)).toBe(true);
    expect(Card.isMonster(spellCard)).toBe(false);
    expect(Card.isMonster(trapCard)).toBe(false);
  });
});

describe("isSpellCard", () => {
  it("should distinguish spell cards from other types", () => {
    const monsterCard: CardData = {
      id: TEST_CARD_IDS.DUMMY,
      jaName: "モンスターカード",
      type: "monster",
      frameType: "normal",
      edition: "latest",
    };
    const spellCard: CardData = {
      id: TEST_CARD_IDS.SPELL_NORMAL,
      jaName: "魔法カード",
      type: "spell",
      frameType: "spell",
      edition: "latest",
    };
    const trapCard: CardData = {
      id: TEST_CARD_IDS.TRAP_NORMAL,
      jaName: "罠カード",
      type: "trap",
      frameType: "trap",
      edition: "latest",
    };

    expect(Card.isSpell(spellCard)).toBe(true);
    expect(Card.isSpell(monsterCard)).toBe(false);
    expect(Card.isSpell(trapCard)).toBe(false);
  });
});

describe("isTrapCard", () => {
  it("should distinguish trap cards from other types", () => {
    const monsterCard: CardData = {
      id: TEST_CARD_IDS.DUMMY,
      jaName: "モンスターカード",
      type: "monster",
      frameType: "normal",
      edition: "latest",
    };
    const spellCard: CardData = {
      id: TEST_CARD_IDS.SPELL_NORMAL,
      jaName: "魔法カード",
      type: "spell",
      frameType: "spell",
      edition: "latest",
    };
    const trapCard: CardData = {
      id: TEST_CARD_IDS.TRAP_NORMAL,
      jaName: "罠カード",
      type: "trap",
      frameType: "trap",
      edition: "latest",
    };

    expect(Card.isTrap(trapCard)).toBe(true);
    expect(Card.isTrap(monsterCard)).toBe(false);
    expect(Card.isTrap(spellCard)).toBe(false);
  });
});
