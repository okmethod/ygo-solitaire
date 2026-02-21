import { describe, it, expect } from "vitest";
import { getDeckRecipe, extractUniqueCardIds, buildDeckData } from "$lib/application/decks/deckLoader";
import { gameFacade } from "$lib/application/GameFacade";

describe("deckLoader - Deck Recipe Loading Test", () => {
  it("should load deck via GameFacade.initializeGame", () => {
    // GameFacade経由でデッキをロード
    const { deckData, uniqueCardIds } = gameFacade.initializeGame("greedy-exodia-deck");

    // 基本検証
    expect(deckData).toBeDefined();
    expect(deckData.name).toBeDefined();
    expect(deckData.mainDeck).toBeDefined();
    expect(deckData.stats).toBeDefined();
    expect(uniqueCardIds.length).toBeGreaterThan(0);
  });

  it("should return CardData in LoadedCardEntry", () => {
    const { deckData } = gameFacade.initializeGame("greedy-exodia-deck");

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
    expect(() => gameFacade.initializeGame("non-existent-deck")).toThrow("Deck not found: non-existent-deck");
  });

  it("should calculate deck stats correctly", () => {
    const { deckData } = gameFacade.initializeGame("greedy-exodia-deck");

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
    const { deckData } = gameFacade.initializeGame("greedy-exodia-deck");

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

describe("deckLoader - Helper Functions", () => {
  it("getDeckRecipe should return deck recipe", () => {
    const deckRecipe = getDeckRecipe("greedy-exodia-deck");

    expect(deckRecipe).toBeDefined();
    expect(deckRecipe.name).toBeDefined();
    expect(deckRecipe.mainDeck).toBeDefined();
    expect(deckRecipe.extraDeck).toBeDefined();
  });

  it("getDeckRecipe should throw for non-existent deck", () => {
    expect(() => getDeckRecipe("non-existent-deck")).toThrow("Deck not found: non-existent-deck");
  });

  it("extractUniqueCardIds should return unique card IDs", () => {
    const deckRecipe = getDeckRecipe("greedy-exodia-deck");
    const uniqueCardIds = extractUniqueCardIds(deckRecipe);

    expect(uniqueCardIds.length).toBeGreaterThan(0);
    // IDが重複していないことを確認
    const uniqueSet = new Set(uniqueCardIds);
    expect(uniqueSet.size).toBe(uniqueCardIds.length);
  });

  it("buildDeckData should build deck data from recipe and registry", () => {
    // GameFacadeで先に初期化（レジストリを準備）
    gameFacade.initializeGame("greedy-exodia-deck");

    const deckRecipe = getDeckRecipe("greedy-exodia-deck");
    const uniqueCardIds = extractUniqueCardIds(deckRecipe);
    const deckData = buildDeckData(deckRecipe, uniqueCardIds);

    expect(deckData.name).toBe(deckRecipe.name);
    expect(deckData.mainDeck).toBeDefined();
    expect(deckData.extraDeck).toBeDefined();
    expect(deckData.stats).toBeDefined();
  });
});
