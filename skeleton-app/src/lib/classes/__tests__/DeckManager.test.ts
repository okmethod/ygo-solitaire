import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DeckManager } from "../DeckManager";
import { DeckRecipe } from "../DeckRecipe";
import type { Card } from "$lib/types/card";

describe("DeckManager", () => {
  let sampleCard: Card;
  let testRecipe: DeckRecipe;

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

    testRecipe = new DeckRecipe({
      name: "テストレシピ",
      mainDeck: [sampleCard],
      extraDeck: [],
      description: "テスト用レシピ",
      category: "テスト",
    });
  });

  afterEach(() => {
    // 各テスト後にクリア
    DeckManager.clearAll();
  });

  describe("registerRecipe", () => {
    it("should register a single recipe", () => {
      DeckManager.registerRecipe(testRecipe);

      const recipes = DeckManager.getRecipes();
      expect(recipes).toHaveLength(1);
      expect(recipes[0].name).toBe("テストレシピ");
    });
  });

  describe("registerRecipes", () => {
    it("should register multiple recipes", () => {
      const recipe2 = new DeckRecipe({
        name: "レシピ2",
        mainDeck: [sampleCard],
        extraDeck: [],
        category: "テスト2",
      });

      DeckManager.registerRecipes([testRecipe, recipe2]);

      const recipes = DeckManager.getRecipes();
      expect(recipes).toHaveLength(2);
      expect(recipes[0].name).toBe("テストレシピ");
      expect(recipes[1].name).toBe("レシピ2");
    });
  });

  describe("getRecipes", () => {
    it("should return empty array when no recipes", () => {
      const recipes = DeckManager.getRecipes();
      expect(recipes).toEqual([]);
    });

    it("should return frozen array", () => {
      DeckManager.registerRecipe(testRecipe);

      const recipes = DeckManager.getRecipes();
      expect(Object.isFrozen(recipes)).toBe(true);
    });
  });

  describe("getRecipeByName", () => {
    beforeEach(() => {
      DeckManager.registerRecipe(testRecipe);
    });

    it("should find existing recipe", () => {
      const found = DeckManager.getRecipeByName("テストレシピ");
      expect(found).not.toBeNull();
      expect(found?.name).toBe("テストレシピ");
    });

    it("should return null for non-existent recipe", () => {
      const found = DeckManager.getRecipeByName("存在しないレシピ");
      expect(found).toBeNull();
    });
  });

  describe("getRecipesByCategory", () => {
    beforeEach(() => {
      const recipe1 = new DeckRecipe({
        name: "レシピ1",
        mainDeck: [sampleCard],
        extraDeck: [],
        category: "ビートダウン",
      });

      const recipe2 = new DeckRecipe({
        name: "レシピ2",
        mainDeck: [sampleCard],
        extraDeck: [],
        category: "ビートダウン",
      });

      const recipe3 = new DeckRecipe({
        name: "レシピ3",
        mainDeck: [sampleCard],
        extraDeck: [],
        category: "コントロール",
      });

      DeckManager.registerRecipes([recipe1, recipe2, recipe3]);
    });

    it("should return recipes by category", () => {
      const beatdownRecipes = DeckManager.getRecipesByCategory("ビートダウン");
      expect(beatdownRecipes).toHaveLength(2);
      expect(beatdownRecipes.every((r) => r.category === "ビートダウン")).toBe(true);
    });

    it("should return empty array for non-existent category", () => {
      const recipes = DeckManager.getRecipesByCategory("存在しないカテゴリ");
      expect(recipes).toEqual([]);
    });
  });

  describe("getCategories", () => {
    it("should return empty array when no recipes", () => {
      const categories = DeckManager.getCategories();
      expect(categories).toEqual([]);
    });

    it("should return unique categories sorted", () => {
      const recipes = [
        new DeckRecipe({
          name: "レシピ1",
          mainDeck: [sampleCard],
          extraDeck: [],
          category: "ビートダウン",
        }),
        new DeckRecipe({
          name: "レシピ2",
          mainDeck: [sampleCard],
          extraDeck: [],
          category: "コントロール",
        }),
        new DeckRecipe({
          name: "レシピ3",
          mainDeck: [sampleCard],
          extraDeck: [],
          category: "ビートダウン", // 重複
        }),
        new DeckRecipe({
          name: "レシピ4",
          mainDeck: [sampleCard],
          extraDeck: [],
          // カテゴリなし
        }),
      ];

      DeckManager.registerRecipes(recipes);

      const categories = DeckManager.getCategories();
      expect(categories).toEqual(["コントロール", "ビートダウン"]); // ソート済み
    });
  });

  describe("hasRecipe", () => {
    beforeEach(() => {
      DeckManager.registerRecipe(testRecipe);
    });

    it("should return true for existing recipe", () => {
      expect(DeckManager.hasRecipe("テストレシピ")).toBe(true);
    });

    it("should return false for non-existent recipe", () => {
      expect(DeckManager.hasRecipe("存在しないレシピ")).toBe(false);
    });
  });

  describe("getRecipeCount", () => {
    it("should return 0 when no recipes", () => {
      expect(DeckManager.getRecipeCount()).toBe(0);
    });

    it("should return correct count", () => {
      DeckManager.registerRecipe(testRecipe);
      expect(DeckManager.getRecipeCount()).toBe(1);

      const recipe2 = new DeckRecipe({
        name: "レシピ2",
        mainDeck: [sampleCard],
        extraDeck: [],
      });
      DeckManager.registerRecipe(recipe2);
      expect(DeckManager.getRecipeCount()).toBe(2);
    });
  });

  describe("clearAll", () => {
    it("should clear all recipes", () => {
      DeckManager.registerRecipe(testRecipe);
      expect(DeckManager.getRecipeCount()).toBe(1);

      DeckManager.clearAll();
      expect(DeckManager.getRecipeCount()).toBe(0);
      expect(DeckManager.getRecipes()).toEqual([]);
    });
  });
});
