import { describe, it, expect } from "vitest";
import type { CardData } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import { DUMMY_CARD_IDS } from "../../../__testUtils__";

/**
 * Card Type Guard Tests
 *
 * TEST STRATEGY: 型ガード関数は境界値と代表的な正常系のみテスト。
 * 実装の裏返しテスト（全プロパティの組み合わせ）は避け、実用的なケースに絞る。
 */

const monsterCard: CardData = {
  id: DUMMY_CARD_IDS.NORMAL_MONSTER,
  jaName: "ダミーモンスターカード",
  type: "monster",
  frameType: "normal",
  edition: "latest",
};

const spellCard: CardData = {
  id: DUMMY_CARD_IDS.NORMAL_SPELL,
  jaName: "ダミー魔法カード",
  type: "spell",
  frameType: "spell",
  edition: "latest",
};

const trapCard: CardData = {
  id: DUMMY_CARD_IDS.NORMAL_TRAP,
  jaName: "ダミー罠カード",
  type: "trap",
  frameType: "trap",
  edition: "latest",
};

describe("isMonsterCard", () => {
  it("should distinguish monster cards from other types", () => {
    expect(Card.isMonster(monsterCard)).toBe(true);
    expect(Card.isMonster(spellCard)).toBe(false);
    expect(Card.isMonster(trapCard)).toBe(false);
  });
});

describe("isSpellCard", () => {
  it("should distinguish spell cards from other types", () => {
    expect(Card.isSpell(spellCard)).toBe(true);
    expect(Card.isSpell(monsterCard)).toBe(false);
    expect(Card.isSpell(trapCard)).toBe(false);
  });
});

describe("isTrapCard", () => {
  it("should distinguish trap cards from other types", () => {
    expect(Card.isTrap(trapCard)).toBe(true);
    expect(Card.isTrap(monsterCard)).toBe(false);
    expect(Card.isTrap(spellCard)).toBe(false);
  });
});
