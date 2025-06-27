import { describe, it, expect, beforeEach } from "vitest";
import { DeckRecipe } from "../DeckRecipe";
import type { Card } from "$lib/types/card";

describe("DeckRecipe", () => {
  let deck: DeckRecipe;
  let sampleCard: Card;
  let monsterCard: Card;
  let spellCard: Card;
  let trapCard: Card;

  beforeEach(() => {
    deck = new DeckRecipe();

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

    trapCard = {
      id: "trap-001",
      name: "テスト罠",
      type: "trap",
      restriction: "unlimited",
    };
  });

  describe("constructor", () => {
    it("should create a deck with default values", () => {
      expect(deck.name).toBe("新しいデッキ");
      expect(deck.mainDeck).toEqual([]);
      expect(deck.extraDeck).toEqual([]);
      expect(deck.createdAt).toBeInstanceOf(Date);
      expect(deck.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a deck with provided data", () => {
      const data = {
        name: "カスタムデッキ",
        mainDeck: [sampleCard],
        extraDeck: [],
        description: "テスト用デッキ",
      };

      const customDeck = new DeckRecipe(data);
      expect(customDeck.name).toBe("カスタムデッキ");
      expect(customDeck.mainDeck).toEqual([sampleCard]);
      expect(customDeck.description).toBe("テスト用デッキ");
    });
  });

  describe("addCard", () => {
    it("should add a card to main deck", () => {
      const result = deck.addCard(sampleCard, "main");
      expect(result).toBe(true);
      expect(deck.mainDeck).toHaveLength(1);
      expect(deck.mainDeck[0]).toEqual(sampleCard);
    });

    it("should add a card to extra deck", () => {
      const result = deck.addCard(sampleCard, "extra");
      expect(result).toBe(true);
      expect(deck.extraDeck).toHaveLength(1);
      expect(deck.extraDeck[0]).toEqual(sampleCard);
    });

    it("should not exceed main deck limit", () => {
      // 60枚まで追加（異なる名前で制限を回避）
      for (let i = 0; i < 60; i++) {
        deck.addCard({ ...sampleCard, id: `card-${i}`, name: `テストカード${i}` }, "main");
      }

      // 61枚目は追加できない
      const result = deck.addCard({ ...sampleCard, id: "card-61", name: "テストカード61" }, "main");
      expect(result).toBe(false);
      expect(deck.mainDeck).toHaveLength(60);
    });

    it("should not exceed extra deck limit", () => {
      // 15枚まで追加（異なる名前で制限を回避）
      for (let i = 0; i < 15; i++) {
        deck.addCard({ ...sampleCard, id: `card-${i}`, name: `エクストラカード${i}` }, "extra");
      }

      // 16枚目は追加できない
      const result = deck.addCard({ ...sampleCard, id: "card-16", name: "エクストラカード16" }, "extra");
      expect(result).toBe(false);
      expect(deck.extraDeck).toHaveLength(15);
    });

    it("should enforce card limits", () => {
      const limitedCard = { ...sampleCard, restriction: "limited" as const };

      // 1枚目は追加できる
      expect(deck.addCard(limitedCard, "main")).toBe(true);

      // 2枚目は追加できない
      expect(deck.addCard({ ...limitedCard, id: "limited-2" }, "main")).toBe(false);
      expect(deck.mainDeck).toHaveLength(1);
    });

    it("should not add forbidden cards", () => {
      const forbiddenCard = { ...sampleCard, restriction: "forbidden" as const };

      const result = deck.addCard(forbiddenCard, "main");
      expect(result).toBe(false);
      expect(deck.mainDeck).toHaveLength(0);
    });
  });

  describe("removeCard", () => {
    beforeEach(() => {
      deck.addCard(sampleCard, "main");
      deck.addCard(monsterCard, "main");
    });

    it("should remove a card from main deck", () => {
      const result = deck.removeCard(sampleCard.id, "main");
      expect(result).toBe(true);
      expect(deck.mainDeck).toHaveLength(1);
      expect(deck.mainDeck[0]).toEqual(monsterCard);
    });

    it("should return false if card not found", () => {
      const result = deck.removeCard("non-existent", "main");
      expect(result).toBe(false);
      expect(deck.mainDeck).toHaveLength(2);
    });
  });

  describe("findCard", () => {
    beforeEach(() => {
      deck.addCard(sampleCard, "main");
      deck.addCard(monsterCard, "extra");
    });

    it("should find card in main deck", () => {
      const result = deck.findCard(sampleCard.id);
      expect(result).toEqual({
        card: sampleCard,
        location: "main",
      });
    });

    it("should find card in extra deck", () => {
      const result = deck.findCard(monsterCard.id);
      expect(result).toEqual({
        card: monsterCard,
        location: "extra",
      });
    });

    it("should return null if card not found", () => {
      const result = deck.findCard("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("validateDeck", () => {
    it("should validate minimum deck size", () => {
      // 40枚未満のデッキ
      for (let i = 0; i < 30; i++) {
        deck.addCard({ ...sampleCard, id: `card-${i}` }, "main");
      }

      const result = deck.validateDeck();
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe("DECK_SIZE");
    });

    it("should validate maximum deck size", () => {
      // 60枚を超えるデッキ（強制的に追加）
      for (let i = 0; i < 70; i++) {
        deck.mainDeck.push({ ...sampleCard, id: `card-${i}` });
      }

      const result = deck.validateDeck();
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.type === "DECK_SIZE")).toBe(true);
    });

    it("should validate valid deck", () => {
      // 40枚のバランスの取れたデッキ（異なる名前で制限を回避）
      for (let i = 0; i < 40; i++) {
        deck.addCard({ ...sampleCard, id: `card-${i}`, name: `バランスカード${i}` }, "main");
      }

      const result = deck.validateDeck();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("getTypeDistribution", () => {
    beforeEach(() => {
      deck.addCard(monsterCard, "main");
      deck.addCard(monsterCard, "main");
      deck.addCard(spellCard, "main");
      deck.addCard(trapCard, "main");
    });

    it("should return correct type distribution", () => {
      const distribution = deck.getTypeDistribution();
      expect(distribution.monster).toBe(2);
      expect(distribution.spell).toBe(1);
      expect(distribution.trap).toBe(1);
    });
  });

  describe("JSON serialization", () => {
    beforeEach(() => {
      deck.name = "テストデッキ";
      deck.addCard(sampleCard, "main");
      deck.addCard(monsterCard, "extra");
    });

    it("should serialize to JSON", () => {
      const json = deck.toJSON();
      expect(typeof json).toBe("string");

      const parsed = JSON.parse(json);
      expect(parsed.name).toBe("テストデッキ");
      expect(parsed.mainDeck).toHaveLength(1);
      expect(parsed.extraDeck).toHaveLength(1);
    });

    it("should deserialize from JSON", () => {
      const json = deck.toJSON();
      const newDeck = DeckRecipe.fromJSON(json);

      expect(newDeck.name).toBe(deck.name);
      expect(newDeck.mainDeck).toEqual(deck.mainDeck);
      expect(newDeck.extraDeck).toEqual(deck.extraDeck);
    });
  });

  describe("createDeck", () => {
    beforeEach(() => {
      deck.name = "テストレシピ";
      for (let i = 0; i < 40; i++) {
        deck.addCard({ ...sampleCard, id: `recipe-${i}`, name: `レシピカード${i}` }, "main");
      }
    });

    it("should create a game deck from recipe", async () => {
      const gameDeck = await deck.createDeck();

      expect(gameDeck.name).toBe("テストレシピ（実戦用）");
      expect(gameDeck.mainDeck).toHaveLength(40);
      expect(gameDeck.sourceRecipe).toBe("テストレシピ");
      expect(gameDeck.mainDeck).not.toBe(deck.mainDeck); // 別のインスタンス
    });

    it("should create deck with custom name", async () => {
      const gameDeck = await deck.createDeck("カスタムデッキ名");
      expect(gameDeck.name).toBe("カスタムデッキ名");
    });
  });

  describe("clone", () => {
    beforeEach(() => {
      deck.name = "オリジナル";
      deck.addCard(sampleCard, "main");
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
