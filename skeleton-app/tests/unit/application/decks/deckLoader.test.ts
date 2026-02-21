import { describe, it, expect } from "vitest";
import { loadDeck } from "$lib/application/decks/deckLoader";

describe("loadDeck - Deck Recipe Loading Test", () => {
  it("should load deck recipe from CardDataRegistry", () => {
    // デッキレシピをロード（純粋関数、API呼び出しなし）
    const { deckRecipe, deckData } = loadDeck("greedy-exodia-deck");

    // 基本検証
    expect(deckRecipe).toBeDefined();
    expect(deckData).toBeDefined();
    expect(deckData.name).toBeDefined();
    expect(deckData.mainDeck).toBeDefined();
    expect(deckData.stats).toBeDefined();
  });

  it("should return CardData in LoadedCardEntry", () => {
    const { deckData } = loadDeck("greedy-exodia-deck");

    // メインデッキのカードを確認
    const allCards = [...deckData.mainDeck.monsters, ...deckData.mainDeck.spells, ...deckData.mainDeck.traps];

    // LoadedCardEntry が CardData を持っていることを確認
    for (const entry of allCards) {
      expect(entry.cardData).toBeDefined();
      expect(entry.cardData.id).toBeDefined();
      expect(entry.cardData.jaName).toBeDefined();
      expect(entry.cardData.type).toBeDefined();
      expect(entry.cardData.frameType).toBeDefined();
      expect(entry.quantity).toBeGreaterThan(0);
    }
  });

  it("should handle missing deck ID", () => {
    // 存在しないデッキIDを指定するとエラーをスロー
    expect(() => loadDeck("non-existent-deck")).toThrow("Deck not found: non-existent-deck");
  });

  it("should calculate deck stats correctly", () => {
    const { deckData } = loadDeck("greedy-exodia-deck");

    // 統計情報が計算されていることを確認
    expect(deckData.stats).toBeDefined();
    expect(deckData.stats.totalCards).toBeGreaterThan(0);
    expect(deckData.stats.uniqueCards).toBeGreaterThan(0);
    expect(typeof deckData.stats.monsterCount).toBe("number");
    expect(typeof deckData.stats.spellCount).toBe("number");
    expect(typeof deckData.stats.trapCount).toBe("number");

    // 統計情報の整合性チェック
    const calculatedMonsterCount = deckData.mainDeck.monsters.reduce((sum, e) => sum + e.quantity, 0);
    const calculatedSpellCount = deckData.mainDeck.spells.reduce((sum, e) => sum + e.quantity, 0);
    const calculatedTrapCount = deckData.mainDeck.traps.reduce((sum, e) => sum + e.quantity, 0);

    expect(deckData.stats.monsterCount).toBe(calculatedMonsterCount);
    expect(deckData.stats.spellCount).toBe(calculatedSpellCount);
    expect(deckData.stats.trapCount).toBe(calculatedTrapCount);
  });

  it("should classify cards by type correctly", () => {
    const { deckData } = loadDeck("greedy-exodia-deck");

    // モンスターカードの検証
    for (const entry of deckData.mainDeck.monsters) {
      expect(entry.cardData.type).toBe("monster");
    }

    // 魔法カードの検証
    for (const entry of deckData.mainDeck.spells) {
      expect(entry.cardData.type).toBe("spell");
    }

    // 罠カードの検証
    for (const entry of deckData.mainDeck.traps) {
      expect(entry.cardData.type).toBe("trap");
    }
  });
});
