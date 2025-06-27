import type { DeckTemplate } from "$lib/types/deck";
import { DeckRecipe } from "./DeckRecipe";

/**
 * DeckManager クラス
 * デッキレシピ（設計図）の管理を行う静的クラス
 * LocalStorageを使用してデッキレシピを永続化
 * 実際のゲーム用デッキインスタンスはDeckクラスを使用
 */
export class DeckManager {
  private static readonly STORAGE_KEY = "ygo_deck_recipes";
  private static readonly TEMPLATES_KEY = "ygo_deck_templates";

  // デッキレシピ（設計図）管理
  static createRecipe(name: string = "新しいデッキレシピ"): DeckRecipe {
    return new DeckRecipe({ name });
  }

  // 後方互換性のため残すが、createRecipe を推奨
  static createDeck(name: string = "新しいデッキ"): DeckRecipe {
    return this.createRecipe(name);
  }

  static saveRecipe(recipe: DeckRecipe): boolean {
    try {
      const existingRecipes = this.listRecipes();
      const index = existingRecipes.findIndex((d: DeckRecipe) => d.name === recipe.name);

      if (index >= 0) {
        existingRecipes[index] = recipe;
      } else {
        existingRecipes.push(recipe);
      }

      const serializedRecipes = existingRecipes.map((d: DeckRecipe) => d.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializedRecipes));
      return true;
    } catch (error) {
      console.error("Failed to save recipe:", error);
      return false;
    }
  }

  // 後方互換性のため残すが、saveRecipe を推奨
  static saveDeck(deck: DeckRecipe): boolean {
    return this.saveRecipe(deck);
  }

  static loadRecipe(name: string): DeckRecipe | null {
    try {
      const recipes = this.listRecipes();
      return recipes.find((recipe) => recipe.name === name) || null;
    } catch (error) {
      console.error("Failed to load recipe:", error);
      return null;
    }
  }

  // 後方互換性のため残すが、loadRecipe を推奨
  static loadDeck(name: string): DeckRecipe | null {
    return this.loadRecipe(name);
  }

  static deleteRecipe(name: string): boolean {
    try {
      const existingRecipes = this.listRecipes();
      const filteredRecipes = existingRecipes.filter((recipe) => recipe.name !== name);

      if (filteredRecipes.length === existingRecipes.length) {
        return false; // レシピが見つからない
      }

      const serializedRecipes = filteredRecipes.map((d) => d.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializedRecipes));
      return true;
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      return false;
    }
  }

  // 後方互換性のため残すが、deleteRecipe を推奨
  static deleteDeck(name: string): boolean {
    return this.deleteRecipe(name);
  }

  static listRecipes(): DeckRecipe[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const serializedRecipes = JSON.parse(stored) as string[];
      return serializedRecipes.map((json) => DeckRecipe.fromJSON(json));
    } catch (error) {
      console.error("Failed to list recipes:", error);
      return [];
    }
  }

  // 後方互換性のため残すが、listRecipes を推奨
  static listDecks(): DeckRecipe[] {
    return this.listRecipes();
  }

  static recipeExists(name: string): boolean {
    return this.listRecipes().some((recipe) => recipe.name === name);
  }

  // 後方互換性のため残すが、recipeExists を推奨
  static deckExists(name: string): boolean {
    return this.recipeExists(name);
  }

  static getUniqueRecipeName(baseName: string): string {
    const existingNames = this.listRecipes().map((recipe) => recipe.name);
    let counter = 1;
    let newName = baseName;

    while (existingNames.includes(newName)) {
      newName = `${baseName} (${counter})`;
      counter++;
    }

    return newName;
  }

  // 後方互換性のため残すが、getUniqueRecipeName を推奨
  static getUniqueDeckName(baseName: string): string {
    return this.getUniqueRecipeName(baseName);
  }

  // テンプレート管理
  static getTemplates(): DeckTemplate[] {
    try {
      const stored = localStorage.getItem(this.TEMPLATES_KEY);
      if (!stored) {
        return this.getDefaultTemplates();
      }

      return JSON.parse(stored) as DeckTemplate[];
    } catch (error) {
      console.error("Failed to get templates:", error);
      return this.getDefaultTemplates();
    }
  }

  static createFromTemplate(templateId: string): DeckRecipe | null {
    const templates = this.getTemplates();
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      return null;
    }

    const uniqueName = this.getUniqueRecipeName(template.name);
    return new DeckRecipe({
      name: uniqueName,
      mainDeck: [...template.mainDeck],
      extraDeck: [...template.extraDeck],
      description: template.description,
      category: template.category,
    });
  }

  static saveTemplate(template: DeckTemplate): boolean {
    try {
      const existingTemplates = this.getTemplates();
      const index = existingTemplates.findIndex((t) => t.id === template.id);

      if (index >= 0) {
        existingTemplates[index] = template;
      } else {
        existingTemplates.push(template);
      }

      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(existingTemplates));
      return true;
    } catch (error) {
      console.error("Failed to save template:", error);
      return false;
    }
  }

  static deleteTemplate(templateId: string): boolean {
    try {
      const existingTemplates = this.getTemplates();
      const filteredTemplates = existingTemplates.filter((template) => template.id !== templateId);

      if (filteredTemplates.length === existingTemplates.length) {
        return false; // テンプレートが見つからない
      }

      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(filteredTemplates));
      return true;
    } catch (error) {
      console.error("Failed to delete template:", error);
      return false;
    }
  }

  // エクスポート・インポート
  static exportRecipe(recipe: DeckRecipe): string {
    return recipe.toJSON();
  }

  // 後方互換性のため残すが、exportRecipe を推奨
  static exportDeck(deck: DeckRecipe): string {
    return this.exportRecipe(deck);
  }

  static importRecipe(jsonData: string): DeckRecipe | null {
    try {
      const recipe = DeckRecipe.fromJSON(jsonData);
      // 重複を避けるため名前をユニークにする
      recipe.name = this.getUniqueRecipeName(recipe.name);
      return recipe;
    } catch (error) {
      console.error("Failed to import recipe:", error);
      return null;
    }
  }

  // 後方互換性のため残すが、importRecipe を推奨
  static importDeck(jsonData: string): DeckRecipe | null {
    return this.importRecipe(jsonData);
  }

  static exportAllRecipes(): string {
    const recipes = this.listRecipes();
    return JSON.stringify(recipes.map((recipe) => recipe.toJSON()));
  }

  // 後方互換性のため残すが、exportAllRecipes を推奨
  static exportAllDecks(): string {
    return this.exportAllRecipes();
  }

  static importAllRecipes(jsonData: string): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    try {
      const recipeJsons = JSON.parse(jsonData) as string[];

      for (const recipeJson of recipeJsons) {
        try {
          const recipe = DeckRecipe.fromJSON(recipeJson);
          recipe.name = this.getUniqueRecipeName(recipe.name);

          if (this.saveRecipe(recipe)) {
            success++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }
    } catch (error) {
      console.error("Failed to import recipes:", error);
      failed = 1;
    }

    return { success, failed };
  }

  // 後方互換性のため残すが、importAllRecipes を推奨
  static importAllDecks(jsonData: string): { success: number; failed: number } {
    return this.importAllRecipes(jsonData);
  }

  // ストレージ管理
  static clearAllData(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TEMPLATES_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear data:", error);
      return false;
    }
  }

  static getStorageSize(): { decks: number; templates: number; total: number } {
    try {
      const decksData = localStorage.getItem(this.STORAGE_KEY) || "";
      const templatesData = localStorage.getItem(this.TEMPLATES_KEY) || "";

      return {
        decks: new Blob([decksData]).size,
        templates: new Blob([templatesData]).size,
        total: new Blob([decksData + templatesData]).size,
      };
    } catch (error) {
      console.error("Failed to get storage size:", error);
      return { decks: 0, templates: 0, total: 0 };
    }
  }

  // デフォルトテンプレート
  private static getDefaultTemplates(): DeckTemplate[] {
    return [
      {
        id: "sample-beatdown",
        name: "サンプルビートダウン",
        description: "攻撃力の高いモンスターで攻める基本的なデッキ",
        category: "ビートダウン",
        mainDeck: [],
        extraDeck: [],
        author: "システム",
        isOfficial: true,
      },
      {
        id: "sample-control",
        name: "サンプルコントロール",
        description: "魔法・罠で場をコントロールするデッキ",
        category: "コントロール",
        mainDeck: [],
        extraDeck: [],
        author: "システム",
        isOfficial: true,
      },
    ];
  }
}
