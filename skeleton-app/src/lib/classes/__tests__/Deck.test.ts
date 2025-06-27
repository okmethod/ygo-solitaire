import { describe, it, expect, beforeEach } from "vitest";
import { Deck } from "../Deck";
import { DeckRecipe } from "../DeckRecipe";
import type { Card } from "$lib/types/card";

describe("Deck", () => {
  let deck: Deck;
  let recipe: DeckRecipe;
  let sampleCard: Card;
  let monsterCard: Card;
  let spellCard: Card;

  beforeEach(() => {
    sampleCard = {
      id: "test-001",
      name: "テストカード",
      type: "monster",
      attack: 1000,
      defense: 800,
      level: 4,
      restriction: "unlimited",
    };

    monsterCard = {
      id: "monster-001",
      name: "テストモンスター",
      type: "monster",
      attack: 2000,
      defense: 1500,
      level: 5,
      restriction: "unlimited",
    };

    spellCard = {
      id: "spell-001",
      name: "テスト魔法",
      type: "spell",
      restriction: "unlimited",
    };

    // サンプルレシピを作成
    recipe = new DeckRecipe({ name: "テストレシピ" });
    for (let i = 0; i < 40; i++) {
      recipe.addCard({ ...sampleCard, id: `card-${i}`, name: `カード${i}` }, "main");
    }

    deck = new Deck();
  });

  describe("constructor", () => {
    it("should create an empty deck with default values", () => {
      expect(deck.name).toBe("新しいデッキ");
      expect(deck.mainDeck).toEqual([]);
      expect(deck.extraDeck).toEqual([]);
      expect(deck.sideDeck).toEqual([]);
      expect(deck.hand).toEqual([]);
      expect(deck.graveyard).toEqual([]);
      expect(deck.banished).toEqual([]);
      expect(deck.field.monsterZones).toEqual([null, null, null, null, null]);
      expect(deck.field.spellTrapZones).toEqual([null, null, null, null, null]);
      expect(deck.field.extraMonsterZone).toBeNull();
      expect(deck.field.fieldSpell).toBeNull();
    });
  });

  describe("fromRecipe", () => {
    it("should create deck from recipe", () => {
      const gameDeck = Deck.fromRecipe(recipe);

      expect(gameDeck.name).toBe("テストレシピ（実戦用）");
      expect(gameDeck.mainDeck).toHaveLength(40);
      expect(gameDeck.sourceRecipe).toBe("テストレシピ");
      expect(gameDeck.mainDeck).not.toBe(recipe.mainDeck); // 別のインスタンス
    });

    it("should create deck with custom name", () => {
      const gameDeck = Deck.fromRecipe(recipe, "カスタム名");
      expect(gameDeck.name).toBe("カスタム名");
    });
  });

  describe("shuffleMainDeck", () => {
    it("should shuffle the main deck", () => {
      // デッキにカードを追加
      const cards = [];
      for (let i = 0; i < 10; i++) {
        const card = { ...sampleCard, id: `shuffle-${i}`, name: `シャッフルカード${i}` };
        cards.push(card);
        deck.mainDeck.push(card);
      }

      const originalOrder = [...deck.mainDeck];
      deck.shuffleMainDeck();

      // 長さは同じ
      expect(deck.mainDeck).toHaveLength(originalOrder.length);
      // すべてのカードが存在
      originalOrder.forEach((card) => {
        expect(deck.mainDeck.find((c) => c.id === card.id)).toBeDefined();
      });
    });
  });

  describe("drawCard", () => {
    beforeEach(() => {
      // デッキに5枚追加
      for (let i = 0; i < 5; i++) {
        deck.mainDeck.push({ ...sampleCard, id: `draw-${i}` });
      }
    });

    it("should draw one card by default", () => {
      const drawnCards = deck.drawCard();

      expect(drawnCards).toHaveLength(1);
      expect(deck.hand).toHaveLength(1);
      expect(deck.mainDeck).toHaveLength(4);
      expect(deck.hand[0]).toEqual(drawnCards[0]);
    });

    it("should draw multiple cards", () => {
      const drawnCards = deck.drawCard(3);

      expect(drawnCards).toHaveLength(3);
      expect(deck.hand).toHaveLength(3);
      expect(deck.mainDeck).toHaveLength(2);
    });

    it("should not draw more cards than available", () => {
      const drawnCards = deck.drawCard(10);

      expect(drawnCards).toHaveLength(5); // 利用可能な分のみ
      expect(deck.hand).toHaveLength(5);
      expect(deck.mainDeck).toHaveLength(0);
    });
  });

  describe("drawInitialHand", () => {
    beforeEach(() => {
      for (let i = 0; i < 10; i++) {
        deck.mainDeck.push({ ...sampleCard, id: `initial-${i}` });
      }
    });

    it("should draw 5 cards by default", () => {
      const initialHand = deck.drawInitialHand();

      expect(initialHand).toHaveLength(5);
      expect(deck.hand).toHaveLength(5);
      expect(deck.mainDeck).toHaveLength(5);
    });

    it("should draw custom number of cards", () => {
      const initialHand = deck.drawInitialHand(7);

      expect(initialHand).toHaveLength(7);
      expect(deck.hand).toHaveLength(7);
      expect(deck.mainDeck).toHaveLength(3);
    });
  });

  describe("summonToField", () => {
    beforeEach(() => {
      deck.hand.push(monsterCard);
      deck.hand.push(spellCard);
    });

    it("should summon monster to monster zone", () => {
      const result = deck.summonToField(monsterCard.id, "monster");

      expect(result).toBe(true);
      expect(deck.field.monsterZones[0]).toEqual(monsterCard);
      expect(deck.hand).toHaveLength(1); // spellCardのみ残る
    });

    it("should place spell in spell/trap zone", () => {
      const result = deck.summonToField(spellCard.id, "spellTrap");

      expect(result).toBe(true);
      expect(deck.field.spellTrapZones[0]).toEqual(spellCard);
      expect(deck.hand).toHaveLength(1); // monsterCardのみ残る
    });

    it("should place card in specific zone", () => {
      const result = deck.summonToField(monsterCard.id, "monster", 2);

      expect(result).toBe(true);
      expect(deck.field.monsterZones[2]).toEqual(monsterCard);
      expect(deck.field.monsterZones[0]).toBeNull();
    });

    it("should return false for non-existent card", () => {
      const result = deck.summonToField("non-existent", "monster");
      expect(result).toBe(false);
    });
  });

  describe("sendToGraveyard", () => {
    beforeEach(() => {
      deck.hand.push(sampleCard);
      deck.field.monsterZones[0] = monsterCard;
    });

    it("should send card from hand to graveyard", () => {
      const result = deck.sendToGraveyard(sampleCard.id, "hand");

      expect(result).toBe(true);
      expect(deck.hand).toHaveLength(0);
      expect(deck.graveyard).toHaveLength(1);
      expect(deck.graveyard[0]).toEqual(sampleCard);
    });

    it("should send card from field to graveyard", () => {
      const result = deck.sendToGraveyard(monsterCard.id, "field");

      expect(result).toBe(true);
      expect(deck.field.monsterZones[0]).toBeNull();
      expect(deck.graveyard).toHaveLength(1);
      expect(deck.graveyard[0]).toEqual(monsterCard);
    });

    it("should return false for non-existent card", () => {
      const result = deck.sendToGraveyard("non-existent", "hand");
      expect(result).toBe(false);
    });
  });

  describe("banishCard", () => {
    beforeEach(() => {
      deck.hand.push(sampleCard);
      deck.graveyard.push(monsterCard);
    });

    it("should banish card from hand", () => {
      const result = deck.banishCard(sampleCard.id, "hand");

      expect(result).toBe(true);
      expect(deck.hand).toHaveLength(0);
      expect(deck.banished).toHaveLength(1);
      expect(deck.banished[0]).toEqual(sampleCard);
    });

    it("should banish card from graveyard", () => {
      const result = deck.banishCard(monsterCard.id, "graveyard");

      expect(result).toBe(true);
      expect(deck.graveyard).toHaveLength(0);
      expect(deck.banished).toHaveLength(1);
      expect(deck.banished[0]).toEqual(monsterCard);
    });
  });

  describe("getGameStats", () => {
    beforeEach(() => {
      // セットアップ
      for (let i = 0; i < 30; i++) {
        deck.mainDeck.push({ ...sampleCard, id: `stats-main-${i}` });
      }
      for (let i = 0; i < 10; i++) {
        deck.extraDeck.push({ ...sampleCard, id: `stats-extra-${i}` });
      }
      deck.hand.push(sampleCard);
      deck.graveyard.push(monsterCard);
      deck.field.monsterZones[0] = spellCard;
    });

    it("should return correct game statistics", () => {
      const stats = deck.getGameStats();

      expect(stats.mainDeckRemaining).toBe(30);
      expect(stats.extraDeckRemaining).toBe(10);
      expect(stats.handSize).toBe(1);
      expect(stats.graveyardSize).toBe(1);
      expect(stats.banishedSize).toBe(0);
      expect(stats.fieldStatus.monstersOnField).toBe(1);
      expect(stats.fieldStatus.spellTrapsOnField).toBe(0);
      expect(stats.fieldStatus.hasFieldSpell).toBe(false);
    });
  });

  describe("reset", () => {
    beforeEach(() => {
      deck.hand.push(sampleCard);
      deck.graveyard.push(monsterCard);
      deck.field.monsterZones[0] = spellCard;
      deck.mainDeck.push({ ...sampleCard, id: "remaining" });
    });

    it("should reset deck to initial state", () => {
      deck.reset();

      expect(deck.hand).toHaveLength(0);
      expect(deck.graveyard).toHaveLength(0);
      expect(deck.banished).toHaveLength(0);
      expect(deck.field.monsterZones.every((zone) => zone === null)).toBe(true);
      expect(deck.field.spellTrapZones.every((zone) => zone === null)).toBe(true);
      expect(deck.mainDeck).toHaveLength(4); // 元の1枚 + 手札、墓地、フィールドから戻った3枚
    });
  });

  describe("JSON serialization", () => {
    beforeEach(() => {
      deck.name = "テストデッキ";
      deck.mainDeck.push(sampleCard);
      deck.hand.push(monsterCard);
    });

    it("should serialize to JSON", () => {
      const json = deck.toJSON();
      expect(typeof json).toBe("string");

      const parsed = JSON.parse(json);
      expect(parsed.name).toBe("テストデッキ");
      expect(parsed.mainDeck).toHaveLength(1);
      expect(parsed.hand).toHaveLength(1);
    });

    it("should deserialize from JSON", () => {
      const json = deck.toJSON();
      const newDeck = Deck.fromJSON(json);

      expect(newDeck.name).toBe(deck.name);
      expect(newDeck.mainDeck).toEqual(deck.mainDeck);
      expect(newDeck.hand).toEqual(deck.hand);
      expect(newDeck).not.toBe(deck); // 別のインスタンス
    });
  });

  describe("clone", () => {
    beforeEach(() => {
      deck.name = "オリジナル";
      deck.mainDeck.push(sampleCard);
    });

    it("should create a deep copy", () => {
      const cloned = deck.clone();

      expect(cloned.name).toBe(deck.name);
      expect(cloned.mainDeck).toEqual(deck.mainDeck);
      expect(cloned).not.toBe(deck); // 別のインスタンス
      expect(cloned.mainDeck).not.toBe(deck.mainDeck); // 別の配列
    });
  });
});
