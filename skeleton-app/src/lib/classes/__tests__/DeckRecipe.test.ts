import { describe, it, expect, beforeEach } from "vitest";
import { DeckRecipe } from "../DeckRecipe";
import type { Card } from "$lib/types/card";

describe("DeckRecipe", () => {
  let sampleCard: Card;
  let monsterCard: Card;
  let spellCard: Card;
  let trapCard: Card;

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

    trapCard = {
      id: "trap-001",
      name: "テスト罠",
      type: "trap",
      restriction: "unlimited",
    };
  });

  describe("constructor", () => {
    it("should create a recipe with readonly properties", () => {
      const recipe = new DeckRecipe({
        name: "静的レシピ",
        mainDeck: [sampleCard],
        extraDeck: [monsterCard],
        description: "テスト用静的レシピ",
        category: "テスト",
      });

      expect(recipe.name).toBe("静的レシピ");
      expect(recipe.mainDeck).toHaveLength(1);
      expect(recipe.extraDeck).toHaveLength(1);
      expect(recipe.description).toBe("テスト用静的レシピ");
      expect(recipe.category).toBe("テスト");

      // readonly性の確認
      expect(Object.isFrozen(recipe.mainDeck)).toBe(true);
      expect(Object.isFrozen(recipe.extraDeck)).toBe(true);
    });

    it("should create a recipe with minimal data", () => {
      const recipe = new DeckRecipe({
        name: "最小レシピ",
        mainDeck: [],
        extraDeck: [],
      });

      expect(recipe.name).toBe("最小レシピ");
      expect(recipe.mainDeck).toHaveLength(0);
      expect(recipe.extraDeck).toHaveLength(0);
      expect(recipe.description).toBeUndefined();
      expect(recipe.category).toBeUndefined();
    });
  });

  describe("createDuelState", () => {
    it("should create a game deck from recipe", async () => {
      const recipe = new DeckRecipe({
        name: "テストレシピ",
        mainDeck: Array(40)
          .fill(null)
          .map((_, i) => ({ ...sampleCard, id: `card-${i}`, name: `カード${i}` })),
        extraDeck: [],
      });

      const gameDuelState = await recipe.createDuelState();

      expect(gameDuelState.name).toBe("テストレシピ");
      expect(gameDuelState.mainDeck).toHaveLength(40);
      expect(gameDuelState.sourceRecipe).toBe("テストレシピ");
    });

    it("should create deck with custom name", async () => {
      const recipe = new DeckRecipe({
        name: "テストレシピ",
        mainDeck: [sampleCard],
        extraDeck: [],
      });

      const gameDuelState = await recipe.createDuelState("カスタムデッキ名");
      expect(gameDuelState.name).toBe("カスタムデッキ名");
    });
  });

  describe("validateRecipe", () => {
    it("should validate minimum deck size", () => {
      const recipe = new DeckRecipe({
        name: "小さすぎるデッキ",
        mainDeck: Array(30)
          .fill(null)
          .map((_, i) => ({ ...sampleCard, id: `card-${i}`, name: `カード${i}` })),
        extraDeck: [],
      });

      const result = recipe.validateRecipe();
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe("DECK_SIZE");
    });

    it("should validate maximum deck size", () => {
      const recipe = new DeckRecipe({
        name: "大きすぎるデッキ",
        mainDeck: Array(70)
          .fill(null)
          .map((_, i) => ({ ...sampleCard, id: `card-${i}`, name: `カード${i}` })),
        extraDeck: [],
      });

      const result = recipe.validateRecipe();
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.type === "DECK_SIZE")).toBe(true);
    });

    it("should validate valid deck", () => {
      const recipe = new DeckRecipe({
        name: "有効なデッキ",
        mainDeck: Array(40)
          .fill(null)
          .map((_, i) => ({ ...sampleCard, id: `card-${i}`, name: `カード${i}` })),
        extraDeck: [],
      });

      const result = recipe.validateRecipe();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate card limits", () => {
      const limitedCard = { ...sampleCard, restriction: "limited" as const };
      const recipe = new DeckRecipe({
        name: "制限違反デッキ",
        mainDeck: [limitedCard, limitedCard], // limited カードを2枚
        extraDeck: [],
      });

      const result = recipe.validateRecipe();
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.type === "CARD_LIMIT")).toBe(true);
    });

    it("should validate forbidden cards", () => {
      const forbiddenCard = { ...sampleCard, restriction: "forbidden" as const };
      const recipe = new DeckRecipe({
        name: "禁止カードデッキ",
        mainDeck: [forbiddenCard],
        extraDeck: [],
      });

      const result = recipe.validateRecipe();
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.type === "FORBIDDEN_CARD")).toBe(true);
    });
  });

  describe("getTypeDistribution", () => {
    it("should return correct type distribution", () => {
      const recipe = new DeckRecipe({
        name: "バランスデッキ",
        mainDeck: [monsterCard, monsterCard, spellCard, trapCard],
        extraDeck: [],
      });

      const distribution = recipe.getTypeDistribution();
      expect(distribution.monster).toBe(2);
      expect(distribution.spell).toBe(1);
      expect(distribution.trap).toBe(1);
    });
  });

  describe("getCardCount", () => {
    it("should return correct card counts", () => {
      const recipe = new DeckRecipe({
        name: "カウントテスト",
        mainDeck: [sampleCard, monsterCard],
        extraDeck: [spellCard],
      });

      const count = recipe.getCardCount();
      expect(count.main).toBe(2);
      expect(count.extra).toBe(1);
      expect(count.total).toBe(3);
    });
  });

  describe("findCardsByName", () => {
    it("should find cards by name", () => {
      const recipe = new DeckRecipe({
        name: "検索テスト",
        mainDeck: [sampleCard, monsterCard],
        extraDeck: [spellCard],
      });

      const found = recipe.findCardsByName("テスト");
      expect(found).toHaveLength(3); // すべてに「テスト」が含まれる
    });

    it("should return empty array if no matches", () => {
      const recipe = new DeckRecipe({
        name: "検索テスト",
        mainDeck: [sampleCard],
        extraDeck: [],
      });

      const found = recipe.findCardsByName("存在しない");
      expect(found).toHaveLength(0);
    });
  });

  describe("JSON serialization", () => {
    it("should serialize to JSON", () => {
      const recipe = new DeckRecipe({
        name: "JSONテスト",
        mainDeck: [sampleCard],
        extraDeck: [monsterCard],
        description: "テスト説明",
        category: "テストカテゴリ",
      });

      const json = recipe.toJSON();
      expect(typeof json).toBe("string");

      const parsed = JSON.parse(json);
      expect(parsed.name).toBe("JSONテスト");
      expect(parsed.mainDeck).toHaveLength(1);
      expect(parsed.extraDeck).toHaveLength(1);
      expect(parsed.description).toBe("テスト説明");
      expect(parsed.category).toBe("テストカテゴリ");
    });

    it("should deserialize from JSON", () => {
      const originalRecipe = new DeckRecipe({
        name: "オリジナル",
        mainDeck: [sampleCard],
        extraDeck: [monsterCard],
      });

      const json = originalRecipe.toJSON();
      const newRecipe = DeckRecipe.fromJSON(json);

      expect(newRecipe.name).toBe(originalRecipe.name);
      expect(newRecipe.mainDeck).toEqual(originalRecipe.mainDeck);
      expect(newRecipe.extraDeck).toEqual(originalRecipe.extraDeck);
    });
  });
});
