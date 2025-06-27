import type { DeckTemplate } from "$lib/types/deck";
import { DeckRecipe } from "./DeckRecipe";

export class DeckManager {
  private static readonly STORAGE_KEY = "ygo_deck_recipes";
  private static readonly TEMPLATES_KEY = "ygo_deck_templates";

  // デッキレシピ管理
  static createDeck(name: string = "新しいデッキ"): DeckRecipe {
    return new DeckRecipe({ name });
  }

  static saveDeck(deck: DeckRecipe): boolean {
    try {
      const existingDecks = this.listDecks();
      const index = existingDecks.findIndex((d) => d.name === deck.name);

      if (index >= 0) {
        existingDecks[index] = deck;
      } else {
        existingDecks.push(deck);
      }

      const serializedDecks = existingDecks.map((d) => d.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializedDecks));
      return true;
    } catch (error) {
      console.error("Failed to save deck:", error);
      return false;
    }
  }

  static loadDeck(name: string): DeckRecipe | null {
    try {
      const decks = this.listDecks();
      return decks.find((deck) => deck.name === name) || null;
    } catch (error) {
      console.error("Failed to load deck:", error);
      return null;
    }
  }

  static deleteDeck(name: string): boolean {
    try {
      const existingDecks = this.listDecks();
      const filteredDecks = existingDecks.filter((deck) => deck.name !== name);

      if (filteredDecks.length === existingDecks.length) {
        return false; // デッキが見つからない
      }

      const serializedDecks = filteredDecks.map((d) => d.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializedDecks));
      return true;
    } catch (error) {
      console.error("Failed to delete deck:", error);
      return false;
    }
  }

  static listDecks(): DeckRecipe[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const serializedDecks = JSON.parse(stored) as string[];
      return serializedDecks.map((json) => DeckRecipe.fromJSON(json));
    } catch (error) {
      console.error("Failed to list decks:", error);
      return [];
    }
  }

  static deckExists(name: string): boolean {
    return this.listDecks().some((deck) => deck.name === name);
  }

  static getUniqueDeckName(baseName: string): string {
    const existingNames = this.listDecks().map((deck) => deck.name);
    let counter = 1;
    let newName = baseName;

    while (existingNames.includes(newName)) {
      newName = `${baseName} (${counter})`;
      counter++;
    }

    return newName;
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

    const uniqueName = this.getUniqueDeckName(template.name);
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
  static exportDeck(deck: DeckRecipe): string {
    return deck.toJSON();
  }

  static importDeck(jsonData: string): DeckRecipe | null {
    try {
      const deck = DeckRecipe.fromJSON(jsonData);
      // 重複を避けるため名前をユニークにする
      deck.name = this.getUniqueDeckName(deck.name);
      return deck;
    } catch (error) {
      console.error("Failed to import deck:", error);
      return null;
    }
  }

  static exportAllDecks(): string {
    const decks = this.listDecks();
    return JSON.stringify(decks.map((deck) => deck.toJSON()));
  }

  static importAllDecks(jsonData: string): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    try {
      const deckJsons = JSON.parse(jsonData) as string[];

      for (const deckJson of deckJsons) {
        try {
          const deck = DeckRecipe.fromJSON(deckJson);
          deck.name = this.getUniqueDeckName(deck.name);

          if (this.saveDeck(deck)) {
            success++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }
    } catch (error) {
      console.error("Failed to import decks:", error);
      failed = 1;
    }

    return { success, failed };
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
