import type { Card } from "$lib/types/card";
import type { DuelStateData, GameDuelStats } from "$lib/types/duel";
import { DeckRecipe } from "$lib/classes/DeckRecipe";

/**
 * DuelState（決闘状態）クラス
 * 実際のゲームで使用する決闘状態のインスタンス
 * DeckRecipe（設計図）から作成され、シャッフル、ドロー、フィールド管理などの操作が可能
 */
export class DuelState {
  public name: string;
  public mainDeck: Card[];
  public extraDeck: Card[];
  public sideDeck: Card[];
  public hands: Card[];
  public field: {
    monsterZones: (Card | null)[];
    spellTrapZones: (Card | null)[];
    fieldSpell: Card | null;
  };
  public graveyard: Card[];
  public banished: Card[];
  public createdAt: Date;
  public sourceRecipe?: string;

  constructor(data: Partial<DuelStateData> = {}) {
    this.name = data.name || "No Name";
    this.mainDeck = data.mainDeck ? [...data.mainDeck] : [];
    this.extraDeck = data.extraDeck ? [...data.extraDeck] : [];
    this.sideDeck = data.sideDeck ? [...data.sideDeck] : [];
    this.hands = data.hands ? [...data.hands] : [];
    this.field = data.field || {
      monsterZones: [null, null, null, null, null], // 5つのモンスターゾーン
      spellTrapZones: [null, null, null, null, null], // 5つの魔法・罠ゾーン
      fieldSpell: null, // フィールド魔法ゾーン
    };
    this.graveyard = data.graveyard ? [...data.graveyard] : [];
    this.banished = data.banished ? [...data.banished] : [];
    this.createdAt = data.createdAt || new Date();
    this.sourceRecipe = data.sourceRecipe;
  }

  /**
   * デッキレシピから決闘状態インスタンスを作成
   */
  static fromRecipe(recipe: DeckRecipe, name?: string): DuelState {
    return new DuelState({
      name: name || recipe.name,
      mainDeck: [...recipe.mainDeck],
      extraDeck: [...recipe.extraDeck],
      sourceRecipe: recipe.name,
    });
  }

  // ゲーム操作メソッド
  /**
   * メインデッキをシャッフル
   */
  shuffleMainDeck(): void {
    this.shuffleArray(this.mainDeck);
  }

  /**
   * カードを手札にドロー
   */
  drawCard(count: number = 1): Card[] {
    const drawnCards: Card[] = [];
    for (let i = 0; i < count && this.mainDeck.length > 0; i++) {
      const card = this.mainDeck.pop();
      if (card) {
        this.hands.push(card);
        drawnCards.push(card);
      }
    }
    return drawnCards;
  }

  /**
   * 初期手札をドロー（通常5枚）
   */
  drawInitialHand(count: number = 5): Card[] {
    return this.drawCard(count);
  }

  /**
   * カードをフィールドに召喚
   */
  summonToField(cardId: string, zone: "monster" | "spellTrap", zoneIndex?: number): boolean {
    const cardIndex = this.hands.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) return false;

    const card = this.hands[cardIndex];

    if (zone === "monster") {
      const targetZone = zoneIndex !== undefined ? zoneIndex : this.field.monsterZones.findIndex((z) => z === null);
      if (targetZone === -1 || targetZone >= 5) return false;

      this.field.monsterZones[targetZone] = card;
    } else {
      const targetZone = zoneIndex !== undefined ? zoneIndex : this.field.spellTrapZones.findIndex((z) => z === null);
      if (targetZone === -1 || targetZone >= 5) return false;

      this.field.spellTrapZones[targetZone] = card;
    }

    this.hands.splice(cardIndex, 1);
    return true;
  }

  /**
   * カードを墓地に送る
   */
  sendToGraveyard(cardId: string, from: "hand" | "field"): boolean {
    if (from === "hand") {
      const cardIndex = this.hands.findIndex((card) => card.id === cardId);
      if (cardIndex === -1) return false;

      const card = this.hands.splice(cardIndex, 1)[0];
      this.graveyard.push(card);
      return true;
    } else {
      // フィールドから墓地へ
      for (let i = 0; i < this.field.monsterZones.length; i++) {
        if (this.field.monsterZones[i]?.id === cardId) {
          const card = this.field.monsterZones[i]!;
          this.field.monsterZones[i] = null;
          this.graveyard.push(card);
          return true;
        }
      }

      for (let i = 0; i < this.field.spellTrapZones.length; i++) {
        if (this.field.spellTrapZones[i]?.id === cardId) {
          const card = this.field.spellTrapZones[i]!;
          this.field.spellTrapZones[i] = null;
          this.graveyard.push(card);
          return true;
        }
      }

      return false;
    }
  }

  /**
   * カードを除外する
   */
  banishCard(cardId: string, from: "hand" | "field" | "graveyard"): boolean {
    let sourceArray: Card[];
    let targetIndex = -1;

    switch (from) {
      case "hand":
        sourceArray = this.hands;
        targetIndex = this.hands.findIndex((card) => card.id === cardId);
        break;
      case "graveyard":
        sourceArray = this.graveyard;
        targetIndex = this.graveyard.findIndex((card) => card.id === cardId);
        break;
      case "field":
        // フィールドの場合は別処理
        return this.banishFromField(cardId);
      default:
        return false;
    }

    if (targetIndex === -1) return false;

    const card = sourceArray.splice(targetIndex, 1)[0];
    this.banished.push(card);
    return true;
  }

  /**
   * フィールドからカードを除外
   */
  private banishFromField(cardId: string): boolean {
    // モンスターゾーンをチェック
    for (let i = 0; i < this.field.monsterZones.length; i++) {
      if (this.field.monsterZones[i]?.id === cardId) {
        const card = this.field.monsterZones[i]!;
        this.field.monsterZones[i] = null;
        this.banished.push(card);
        return true;
      }
    }

    // 魔法・罠ゾーンをチェック
    for (let i = 0; i < this.field.spellTrapZones.length; i++) {
      if (this.field.spellTrapZones[i]?.id === cardId) {
        const card = this.field.spellTrapZones[i]!;
        this.field.spellTrapZones[i] = null;
        this.banished.push(card);
        return true;
      }
    }

    return false;
  }

  /**
   * ゲーム状況の統計を取得
   */
  getGameStats(): GameDuelStats {
    return {
      mainDeckRemaining: this.mainDeck.length,
      extraDeckRemaining: this.extraDeck.length,
      handsSize: this.hands.length,
      graveyardSize: this.graveyard.length,
      banishedSize: this.banished.length,
      fieldStatus: {
        monstersOnField: this.field.monsterZones.filter((zone) => zone !== null).length,
        spellTrapsOnField: this.field.spellTrapZones.filter((zone) => zone !== null).length,
        hasFieldSpell: this.field.fieldSpell !== null,
      },
    };
  }

  /**
   * デッキをリセット（初期状態に戻す）
   */
  reset(): void {
    // すべてのカードをメインデッキに戻す
    const allCards = [
      ...this.hands,
      ...this.graveyard,
      ...this.banished,
      ...(this.field.monsterZones.filter((card) => card !== null) as Card[]),
      ...(this.field.spellTrapZones.filter((card) => card !== null) as Card[]),
    ];

    if (this.field.fieldSpell) {
      allCards.push(this.field.fieldSpell);
    }

    this.mainDeck.push(...allCards);
    this.hands = [];
    this.graveyard = [];
    this.banished = [];
    this.field = {
      monsterZones: [null, null, null, null, null],
      spellTrapZones: [null, null, null, null, null],
      fieldSpell: null,
    };
  }

  /**
   * JSON形式で出力
   */
  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      mainDeck: this.mainDeck,
      extraDeck: this.extraDeck,
      sideDeck: this.sideDeck,
      hands: this.hands,
      field: this.field,
      graveyard: this.graveyard,
      banished: this.banished,
      createdAt: this.createdAt.toISOString(),
      sourceRecipe: this.sourceRecipe,
    });
  }

  /**
   * JSONから決闘状態インスタンスを復元
   */
  static fromJSON(json: string): DuelState {
    const data = JSON.parse(json);
    return new DuelState({
      ...data,
      createdAt: new Date(data.createdAt),
    });
  }

  /**
   * 決闘状態のクローンを作成
   */
  clone(): DuelState {
    return DuelState.fromJSON(this.toJSON());
  }

  // ユーティリティメソッド
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
