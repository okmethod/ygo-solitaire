import type { Card } from "$lib/types/card";
import type {
  DeckRecipeData,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  DeckStats,
  CardTypeStats,
  SortCriteria,
  SortOrder,
} from "$lib/types/deck";

export class DeckRecipe {
  public name: string;
  public mainDeck: Card[];
  public extraDeck: Card[];
  public createdAt: Date;
  public updatedAt: Date;
  public description?: string;
  public category?: string;

  constructor(data: Partial<DeckRecipeData> = {}) {
    this.name = data.name || "新しいデッキ";
    this.mainDeck = data.mainDeck || [];
    this.extraDeck = data.extraDeck || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.description = data.description;
    this.category = data.category;
  }

  // カード操作メソッド
  addCard(card: Card, target: "main" | "extra" = "main"): boolean {
    const targetDeck = target === "main" ? this.mainDeck : this.extraDeck;
    const maxSize = target === "main" ? 60 : 15; // メインデッキは最大60枚

    if (targetDeck.length >= maxSize) {
      return false;
    }

    // 同名カード制限チェック
    const sameNameCount = targetDeck.filter((c) => c.name === card.name).length;
    const cardLimit = this.getCardLimit(card);

    if (sameNameCount >= cardLimit) {
      return false;
    }

    targetDeck.push({ ...card });
    this.updatedAt = new Date();
    return true;
  }

  removeCard(cardId: string, target: "main" | "extra" = "main"): boolean {
    const targetDeck = target === "main" ? this.mainDeck : this.extraDeck;
    const index = targetDeck.findIndex((card) => card.id === cardId);

    if (index === -1) {
      return false;
    }

    targetDeck.splice(index, 1);
    this.updatedAt = new Date();
    return true;
  }

  findCard(cardId: string): { card: Card; location: "main" | "extra" } | null {
    let card = this.mainDeck.find((c) => c.id === cardId);
    if (card) {
      return { card, location: "main" };
    }

    card = this.extraDeck.find((c) => c.id === cardId);
    if (card) {
      return { card, location: "extra" };
    }

    return null;
  }

  findCardsByName(name: string): Card[] {
    return [...this.mainDeck, ...this.extraDeck].filter((card) => card.name.toLowerCase().includes(name.toLowerCase()));
  }

  // デッキ操作メソッド
  shuffle(): void {
    this.shuffleArray(this.mainDeck);
    this.shuffleArray(this.extraDeck);
    this.updatedAt = new Date();
  }

  sort(criteria: SortCriteria, order: SortOrder = "asc", target: "main" | "extra" | "both" = "both"): void {
    const sortFunction = this.getSortFunction(criteria, order);

    if (target === "main" || target === "both") {
      this.mainDeck.sort(sortFunction);
    }
    if (target === "extra" || target === "both") {
      this.extraDeck.sort(sortFunction);
    }

    this.updatedAt = new Date();
  }

  // バリデーションメソッド
  validateDeck(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // メインデッキサイズチェック
    if (this.mainDeck.length < 40) {
      errors.push({
        type: "DECK_SIZE",
        message: `メインデッキが不足しています（${this.mainDeck.length}/40枚）`,
      });
    } else if (this.mainDeck.length > 60) {
      errors.push({
        type: "DECK_SIZE",
        message: `メインデッキが多すぎます（${this.mainDeck.length}/60枚）`,
      });
    }

    // エクストラデッキサイズチェック
    if (this.extraDeck.length > 15) {
      errors.push({
        type: "DECK_SIZE",
        message: `エクストラデッキが多すぎます（${this.extraDeck.length}/15枚）`,
      });
    }

    // 同名カード制限チェック
    this.validateCardLimits(errors);

    // 禁止カードチェック
    this.validateForbiddenCards(errors);

    // 推奨事項チェック
    this.validateRecommendations(warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  isValidDeck(): boolean {
    return this.validateDeck().isValid;
  }

  // 統計メソッド
  getCardCount(): { main: number; extra: number; total: number } {
    return {
      main: this.mainDeck.length,
      extra: this.extraDeck.length,
      total: this.mainDeck.length + this.extraDeck.length,
    };
  }

  getTypeDistribution(): CardTypeStats {
    const allCards = [...this.mainDeck, ...this.extraDeck];
    return {
      monster: allCards.filter((card) => card.type === "monster").length,
      spell: allCards.filter((card) => card.type === "spell").length,
      trap: allCards.filter((card) => card.type === "trap").length,
    };
  }

  getDeckStats(): DeckStats {
    const allCards = [...this.mainDeck, ...this.extraDeck];

    return {
      totalCards: this.getCardCount(),
      typeDistribution: this.getTypeDistribution(),
      levelDistribution: this.getLevelDistribution(allCards),
      attributeDistribution: this.getAttributeDistribution(allCards),
      raceDistribution: this.getRaceDistribution(allCards),
    };
  }

  // 永続化メソッド
  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      mainDeck: this.mainDeck,
      extraDeck: this.extraDeck,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      description: this.description,
      category: this.category,
    });
  }

  static fromJSON(json: string): DeckRecipe {
    const data = JSON.parse(json);
    return new DeckRecipe({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  // ユーティリティメソッド
  clone(): DeckRecipe {
    return DeckRecipe.fromJSON(this.toJSON());
  }

  clear(): void {
    this.mainDeck = [];
    this.extraDeck = [];
    this.updatedAt = new Date();
  }

  // プライベートメソッド
  private getCardLimit(card: Card): number {
    switch (card.restriction) {
      case "forbidden":
        return 0;
      case "limited":
        return 1;
      case "semi_limited":
        return 2;
      default:
        return 3;
    }
  }

  private shuffleArray(array: Card[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private getSortFunction(criteria: SortCriteria, order: SortOrder) {
    const modifier = order === "asc" ? 1 : -1;

    return (a: Card, b: Card): number => {
      let aValue: string | number;
      let bValue: string | number;

      switch (criteria) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "level":
          aValue = a.level || 0;
          bValue = b.level || 0;
          break;
        case "attack":
          aValue = a.attack || 0;
          bValue = b.attack || 0;
          break;
        case "defense":
          aValue = a.defense || 0;
          bValue = b.defense || 0;
          break;
        case "rarity":
          aValue = a.rarity || "common";
          bValue = b.rarity || "common";
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * modifier;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * modifier;
      }

      return 0;
    };
  }

  private validateCardLimits(errors: ValidationError[]): void {
    const cardCounts = new Map<string, number>();

    [...this.mainDeck, ...this.extraDeck].forEach((card) => {
      const count = cardCounts.get(card.name) || 0;
      cardCounts.set(card.name, count + 1);
    });

    cardCounts.forEach((count, cardName) => {
      const card = [...this.mainDeck, ...this.extraDeck].find((c) => c.name === cardName);
      if (card) {
        const limit = this.getCardLimit(card);
        if (count > limit) {
          errors.push({
            type: "CARD_LIMIT",
            message: `「${cardName}」が制限枚数を超えています（${count}/${limit}枚）`,
            cardName,
          });
        }
      }
    });
  }

  private validateForbiddenCards(errors: ValidationError[]): void {
    [...this.mainDeck, ...this.extraDeck].forEach((card) => {
      if (card.restriction === "forbidden") {
        errors.push({
          type: "FORBIDDEN_CARD",
          message: `「${card.name}」は禁止カードです`,
          cardId: card.id,
          cardName: card.name,
        });
      }
    });
  }

  private validateRecommendations(warnings: ValidationWarning[]): void {
    if (this.mainDeck.length === 40) {
      // 40枚ちょうどの場合の推奨
    } else if (this.mainDeck.length > 40) {
      warnings.push({
        type: "DECK_RECOMMENDATION",
        message: "デッキ枚数を40枚に近づけることを推奨します",
      });
    }
  }

  private getLevelDistribution(cards: Card[]): Record<number, number> {
    const distribution: Record<number, number> = {};
    cards.forEach((card) => {
      if (card.level !== undefined) {
        distribution[card.level] = (distribution[card.level] || 0) + 1;
      }
    });
    return distribution;
  }

  private getAttributeDistribution(cards: Card[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    cards.forEach((card) => {
      if (card.attribute) {
        distribution[card.attribute] = (distribution[card.attribute] || 0) + 1;
      }
    });
    return distribution;
  }

  private getRaceDistribution(cards: Card[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    cards.forEach((card) => {
      if (card.race) {
        distribution[card.race] = (distribution[card.race] || 0) + 1;
      }
    });
    return distribution;
  }
}
