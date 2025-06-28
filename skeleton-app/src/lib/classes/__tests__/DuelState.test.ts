import { describe, it, expect, beforeEach } from "vitest";
import { DuelState } from "../DuelState";
import type { CardData } from "$lib/types/card";
import type { DeckData, LoadedCardEntry } from "$lib/types/deck";

describe("DuelState", () => {
  let duelState: DuelState;
  let deckData: DeckData;
  let sampleCardData: CardData;
  let monsterCardData: CardData;
  let spellCardData: CardData;

  beforeEach(() => {
    sampleCardData = {
      id: 1001,
      name: "テストカード",
      type: "monster",
      description: "テスト用のモンスターカード",
      monster: {
        attack: 1000,
        defense: 800,
        level: 4,
        attribute: "LIGHT",
        race: "Warrior",
      },
    };

    monsterCardData = {
      id: 2001,
      name: "テストモンスター",
      type: "monster",
      description: "テスト用の強力なモンスターカード",
      monster: {
        attack: 2000,
        defense: 1500,
        level: 5,
        attribute: "DARK",
        race: "Dragon",
      },
    };

    spellCardData = {
      id: 3001,
      name: "テスト魔法",
      type: "spell",
      description: "テスト用の魔法カード",
    };

    // サンプルレシピを作成（LoadedCardEntry形式）
    const mainDeck: LoadedCardEntry[] = Array(40)
      .fill(null)
      .map((_, i) => ({
        cardData: { ...sampleCardData, id: 5000 + i, name: `カード${i}` },
        quantity: 1,
      }));

    deckData = {
      name: "テストデッキ",
      mainDeck,
      extraDeck: [],
      stats: {
        totalCards: 40,
        uniqueCards: 40,
        monsterCount: 40,
        spellCount: 0,
        trapCount: 0,
      },
    };

    duelState = new DuelState();
  });

  describe("constructor", () => {
    it("should create an empty duel state with default values", () => {
      expect(duelState.name).toBe("No Name");
      expect(duelState.mainDeck).toEqual([]);
      expect(duelState.extraDeck).toEqual([]);
      expect(duelState.sideDeck).toEqual([]);
      expect(duelState.hands).toEqual([]);
      expect(duelState.graveyard).toEqual([]);
      expect(duelState.banished).toEqual([]);
      expect(duelState.field.monsterZones).toEqual([null, null, null, null, null]);
      expect(duelState.field.spellTrapZones).toEqual([null, null, null, null, null]);
      expect(duelState.field.fieldSpell).toBeNull();
    });
  });

  describe("loadDeck", () => {
    it("should create duel state from deck", () => {
      const gameDuelState = DuelState.loadDeck(deckData);

      expect(gameDuelState.name).toBe("テストデッキ");
      expect(gameDuelState.mainDeck).toHaveLength(40);
      expect(gameDuelState.sourceRecipe).toBe("テストデッキ");
      expect(gameDuelState.mainDeck).not.toBe(deckData.mainDeck); // 別のインスタンス
    });

    it("should create duel state with custom name", () => {
      const gameDuelState = DuelState.loadDeck(deckData, "カスタム名");
      expect(gameDuelState.name).toBe("カスタム名");
    });
  });

  describe("shuffleMainDeck", () => {
    it("should shuffle the main deck", () => {
      // デッキにカードを追加
      const cards = [];
      for (let i = 0; i < 10; i++) {
        const card = { ...sampleCardData, id: 6000 + i, name: `シャッフルカード${i}` };
        cards.push(card);
        duelState.mainDeck.push(card);
      }

      const originalOrder = [...duelState.mainDeck];
      duelState.shuffleMainDeck();

      // 長さは同じ
      expect(duelState.mainDeck).toHaveLength(originalOrder.length);
      // すべてのカードが存在
      originalOrder.forEach((card) => {
        expect(duelState.mainDeck.find((c) => c.id === card.id)).toBeDefined();
      });
    });
  });

  describe("drawCard", () => {
    beforeEach(() => {
      // デッキに5枚追加
      for (let i = 0; i < 5; i++) {
        duelState.mainDeck.push({ ...sampleCardData, id: 7000 + i });
      }
    });

    it("should draw one card by default", () => {
      const drawnCards = duelState.drawCard();

      expect(drawnCards).toHaveLength(1);
      expect(duelState.hands).toHaveLength(1);
      expect(duelState.mainDeck).toHaveLength(4);
      expect(duelState.hands[0]).toEqual(drawnCards[0]);
    });

    it("should draw multiple cards", () => {
      const drawnCards = duelState.drawCard(3);

      expect(drawnCards).toHaveLength(3);
      expect(duelState.hands).toHaveLength(3);
      expect(duelState.mainDeck).toHaveLength(2);
    });

    it("should not draw more cards than available", () => {
      const drawnCards = duelState.drawCard(10);

      expect(drawnCards).toHaveLength(5); // 利用可能な分のみ
      expect(duelState.hands).toHaveLength(5);
      expect(duelState.mainDeck).toHaveLength(0);
    });
  });

  describe("drawInitialHands", () => {
    beforeEach(() => {
      for (let i = 0; i < 10; i++) {
        duelState.mainDeck.push({ ...sampleCardData, id: 8000 + i });
      }
    });

    it("should draw 5 cards by default", () => {
      const initialHand = duelState.drawInitialHands();

      expect(initialHand).toHaveLength(5);
      expect(duelState.hands).toHaveLength(5);
      expect(duelState.mainDeck).toHaveLength(5);
    });

    it("should draw custom number of cards", () => {
      const initialHand = duelState.drawInitialHands(7);

      expect(initialHand).toHaveLength(7);
      expect(duelState.hands).toHaveLength(7);
      expect(duelState.mainDeck).toHaveLength(3);
    });
  });

  describe("summonToField", () => {
    beforeEach(() => {
      duelState.hands.push({ ...monsterCardData });
      duelState.hands.push({ ...spellCardData });
    });

    it("should summon monster to monster zone", () => {
      const result = duelState.summonToField(monsterCardData.id, "monster");

      expect(result).toBe(true);
      expect(duelState.field.monsterZones[0]).toEqual({ ...monsterCardData });
      expect(duelState.hands).toHaveLength(1); // spellCardのみ残る
    });

    it("should place spell in spell/trap zone", () => {
      const result = duelState.summonToField(spellCardData.id, "spellTrap");

      expect(result).toBe(true);
      expect(duelState.field.spellTrapZones[0]).toEqual({ ...spellCardData });
      expect(duelState.hands).toHaveLength(1); // monsterCardのみ残る
    });

    it("should place card in specific zone", () => {
      const result = duelState.summonToField(monsterCardData.id, "monster", 2);

      expect(result).toBe(true);
      expect(duelState.field.monsterZones[2]).toEqual({ ...monsterCardData });
      expect(duelState.field.monsterZones[0]).toBeNull();
    });

    it("should return false for non-existent card", () => {
      const result = duelState.summonToField(99999, "monster");
      expect(result).toBe(false);
    });
  });

  describe("sendToGraveyard", () => {
    beforeEach(() => {
      duelState.hands.push({ ...sampleCardData });
      duelState.field.monsterZones[0] = { ...monsterCardData };
    });

    it("should send card from hand to graveyard", () => {
      const result = duelState.sendToGraveyard(sampleCardData.id, "hand");

      expect(result).toBe(true);
      expect(duelState.hands).toHaveLength(0);
      expect(duelState.graveyard).toHaveLength(1);
      expect(duelState.graveyard[0]).toEqual({ ...sampleCardData });
    });

    it("should send card from field to graveyard", () => {
      const result = duelState.sendToGraveyard(monsterCardData.id, "field");

      expect(result).toBe(true);
      expect(duelState.field.monsterZones[0]).toBeNull();
      expect(duelState.graveyard).toHaveLength(1);
      expect(duelState.graveyard[0]).toEqual({ ...monsterCardData });
    });

    it("should return false for non-existent card", () => {
      const result = duelState.sendToGraveyard(99999, "hand");
      expect(result).toBe(false);
    });
  });

  describe("banishCard", () => {
    beforeEach(() => {
      duelState.hands.push({ ...sampleCardData });
      duelState.graveyard.push({ ...monsterCardData });
    });

    it("should banish card from hand", () => {
      const result = duelState.banishCard(sampleCardData.id, "hand");

      expect(result).toBe(true);
      expect(duelState.hands).toHaveLength(0);
      expect(duelState.banished).toHaveLength(1);
      expect(duelState.banished[0]).toEqual({ ...sampleCardData });
    });

    it("should banish card from graveyard", () => {
      const result = duelState.banishCard(monsterCardData.id, "graveyard");

      expect(result).toBe(true);
      expect(duelState.graveyard).toHaveLength(0);
      expect(duelState.banished).toHaveLength(1);
      expect(duelState.banished[0]).toEqual({ ...monsterCardData });
    });
  });

  describe("getDuelStats", () => {
    beforeEach(() => {
      // セットアップ
      for (let i = 0; i < 30; i++) {
        duelState.mainDeck.push({ ...sampleCardData, id: 9000 + i });
      }
      for (let i = 0; i < 10; i++) {
        duelState.extraDeck.push({ ...sampleCardData, id: 9500 + i });
      }
      duelState.hands.push({ ...sampleCardData });
      duelState.graveyard.push({ ...monsterCardData });
      duelState.field.monsterZones[0] = { ...spellCardData };
    });

    it("should return correct game statistics", () => {
      const stats = duelState.getDuelStats();

      expect(stats.mainDeckRemaining).toBe(30);
      expect(stats.extraDeckRemaining).toBe(10);
      expect(stats.handsSize).toBe(1);
      expect(stats.graveyardSize).toBe(1);
      expect(stats.banishedSize).toBe(0);
      expect(stats.fieldStatus.monstersOnField).toBe(1);
      expect(stats.fieldStatus.spellTrapsOnField).toBe(0);
      expect(stats.fieldStatus.hasFieldSpell).toBe(false);
    });
  });

  describe("reset", () => {
    beforeEach(() => {
      duelState.hands.push({ ...sampleCardData });
      duelState.graveyard.push({ ...monsterCardData });
      duelState.field.monsterZones[0] = { ...spellCardData };
      duelState.mainDeck.push({ ...sampleCardData, id: 10000 });
    });

    it("should reset duel state to initial state", () => {
      duelState.reset();

      expect(duelState.hands).toHaveLength(0);
      expect(duelState.graveyard).toHaveLength(0);
      expect(duelState.banished).toHaveLength(0);
      expect(duelState.field.monsterZones.every((zone) => zone === null)).toBe(true);
      expect(duelState.field.spellTrapZones.every((zone) => zone === null)).toBe(true);
      expect(duelState.mainDeck).toHaveLength(4); // 元の1枚 + 手札、墓地、フィールドから戻った3枚
    });
  });

  describe("JSON serialization", () => {
    beforeEach(() => {
      duelState.name = "テスト決闘状態";
      duelState.mainDeck.push({ ...sampleCardData });
      duelState.hands.push({ ...monsterCardData });
    });

    it("should serialize to JSON", () => {
      const json = duelState.toJSON();
      expect(typeof json).toBe("string");

      const parsed = JSON.parse(json);
      expect(parsed.name).toBe("テスト決闘状態");
      expect(parsed.mainDeck).toHaveLength(1);
      expect(parsed.hands).toHaveLength(1);
    });

    it("should deserialize from JSON", () => {
      const json = duelState.toJSON();
      const newDuelState = DuelState.fromJSON(json);

      expect(newDuelState.name).toBe(duelState.name);
      expect(newDuelState.mainDeck).toEqual(duelState.mainDeck);
      expect(newDuelState.hands).toEqual(duelState.hands);
      expect(newDuelState).not.toBe(duelState); // 別のインスタンス
    });
  });

  describe("clone", () => {
    beforeEach(() => {
      duelState.name = "オリジナル";
      duelState.mainDeck.push({ ...sampleCardData });
    });

    it("should create a deep copy", () => {
      const cloned = duelState.clone();

      expect(cloned.name).toBe(duelState.name);
      expect(cloned.mainDeck).toEqual(duelState.mainDeck);
      expect(cloned).not.toBe(duelState); // 別のインスタンス
      expect(cloned.mainDeck).not.toBe(duelState.mainDeck); // 別の配列
    });
  });
});
