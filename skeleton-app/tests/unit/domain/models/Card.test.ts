/**
 * Card モデルのテスト
 *
 * テスト方針: 型ガード関数は境界値と代表的な正常系のみテスト。
 * 実装の裏返しテスト（全プロパティの組み合わせ）は避け、実用的なケースに絞る。
 */

import { describe, it, expect } from "vitest";
import type { CardData } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import { DUMMY_CARD_IDS } from "../../../__testUtils__";

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
  it("モンスターカードを他のカード種別と区別できる", () => {
    expect(Card.isMonster(monsterCard)).toBe(true);
    expect(Card.isMonster(spellCard)).toBe(false);
    expect(Card.isMonster(trapCard)).toBe(false);
  });
});

describe("isSpellCard", () => {
  it("魔法カードを他のカード種別と区別できる", () => {
    expect(Card.isSpell(spellCard)).toBe(true);
    expect(Card.isSpell(monsterCard)).toBe(false);
    expect(Card.isSpell(trapCard)).toBe(false);
  });
});

describe("isTrapCard", () => {
  it("罠カードを他のカード種別と区別できる", () => {
    expect(Card.isTrap(trapCard)).toBe(true);
    expect(Card.isTrap(monsterCard)).toBe(false);
    expect(Card.isTrap(spellCard)).toBe(false);
  });
});
