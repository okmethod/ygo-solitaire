import { DeckRecipe } from "$lib/classes/DeckRecipe";

/**
 * DeckManager クラス
 * 開発者が予め用意した静的なデッキレシピの管理
 * 永続化や編集機能は不要
 */
export class DeckManager {
  private static recipes: DeckRecipe[] = [];

  /**
   * 静的デッキレシピを登録
   */
  static registerRecipe(recipe: DeckRecipe): void {
    this.recipes.push(recipe);
  }

  /**
   * 複数のレシピを一括登録
   */
  static registerRecipes(recipes: DeckRecipe[]): void {
    this.recipes.push(...recipes);
  }

  /**
   * 登録されているレシピ一覧を取得
   */
  static getRecipes(): readonly DeckRecipe[] {
    return Object.freeze([...this.recipes]);
  }

  /**
   * 名前でレシピを検索
   */
  static getRecipeByName(name: string): DeckRecipe | null {
    return this.recipes.find((recipe) => recipe.name === name) || null;
  }

  /**
   * カテゴリでレシピを検索
   */
  static getRecipesByCategory(category: string): DeckRecipe[] {
    return this.recipes.filter((recipe) => recipe.category === category);
  }

  /**
   * 利用可能なカテゴリ一覧を取得
   */
  static getCategories(): string[] {
    const categories = new Set(
      this.recipes.map((recipe) => recipe.category).filter((category): category is string => Boolean(category)),
    );
    return Array.from(categories).sort();
  }

  /**
   * レシピが存在するかチェック
   */
  static hasRecipe(name: string): boolean {
    return this.recipes.some((recipe) => recipe.name === name);
  }

  /**
   * 登録されているレシピ数を取得
   */
  static getRecipeCount(): number {
    return this.recipes.length;
  }

  /**
   * 全レシピをクリア（テスト用）
   */
  static clearAll(): void {
    this.recipes = [];
  }
}
