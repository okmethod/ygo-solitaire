import type { Card } from "$lib/types/card";
import type { DeckRecipeData, ValidationResult, ValidationError, CardTypeStats } from "$lib/types/recipe";

/**
 * DeckRecipe（デッキレシピ）クラス
 * 開発者が予め用意する静的なカードリスト（設計図）
 * ユーザーによる編集は不可、永続化も不要
 */
export class DeckRecipe {
  public readonly name: string;
  public readonly mainDeck: readonly Card[];
  public readonly extraDeck: readonly Card[];
  public readonly description?: string;
  public readonly category?: string;

  constructor(data: DeckRecipeData) {
    this.name = data.name;
    this.mainDeck = Object.freeze([...data.mainDeck]);
    this.extraDeck = Object.freeze([...data.extraDeck]);
    this.description = data.description;
    this.category = data.category;
  }

  /**
   * このレシピからゲーム用決闘状態インスタンスを作成
   */
  async createDuelState(duelName?: string): Promise<import("./DuelState").DuelState> {
    const { DuelState } = await import("./DuelState");
    return DuelState.fromRecipe(this, duelName);
  }

  /**
   * デッキレシピの基本的なバリデーション
   */
  validateRecipe(): ValidationResult {
    const errors: ValidationError[] = [];

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

    // カード制限チェック
    this.validateCardLimits(errors);

    // 禁止カードチェック
    this.validateForbiddenCards(errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [], // 静的レシピでは警告は不要
    };
  }

  /**
   * カードタイプ別の分布を取得
   */
  getTypeDistribution(): CardTypeStats {
    const allCards = [...this.mainDeck, ...this.extraDeck];
    return {
      monster: allCards.filter((card) => card.type === "monster").length,
      spell: allCards.filter((card) => card.type === "spell").length,
      trap: allCards.filter((card) => card.type === "trap").length,
    };
  }

  /**
   * カード枚数を取得
   */
  getCardCount(): { main: number; extra: number; total: number } {
    return {
      main: this.mainDeck.length,
      extra: this.extraDeck.length,
      total: this.mainDeck.length + this.extraDeck.length,
    };
  }

  /**
   * 指定した名前のカードを検索
   */
  findCardsByName(name: string): Card[] {
    return [...this.mainDeck, ...this.extraDeck].filter((card) => card.name.toLowerCase().includes(name.toLowerCase()));
  }

  /**
   * JSON形式でエクスポート（デバッグ用）
   */
  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      mainDeck: this.mainDeck,
      extraDeck: this.extraDeck,
      description: this.description,
      category: this.category,
    });
  }

  /**
   * JSONからデッキレシピを作成（静的データ読み込み用）
   */
  static fromJSON(json: string): DeckRecipe {
    const data = JSON.parse(json);
    return new DeckRecipe(data);
  }

  // プライベートメソッド
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
}
