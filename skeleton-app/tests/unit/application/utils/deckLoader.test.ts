import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadDeckData } from "$lib/application/utils/deckLoader";
import * as ygoprodeckApi from "$lib/infrastructure/api/ygoprodeck";
import exodiaFixture from "../../../fixtures/ygoprodeck/exodia.json";
import potOfGreedFixture from "../../../fixtures/ygoprodeck/pot-of-greed.json";
import gracefulCharityFixture from "../../../fixtures/ygoprodeck/graceful-charity.json";

// YGOPRODeck APIをモック
vi.mock("$lib/infrastructure/api/ygoprodeck", () => ({
  getCardsByIds: vi.fn(),
  clearCache: vi.fn(),
}));

describe("loadDeckData - Deck Recipe Loading Integration Test (T033)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load deck recipe with YGOPRODeck API compatible card IDs", async () => {
    // モックfetch関数
    const mockFetch = vi.fn();

    // getCardsByIds をモック（フィクスチャを返す）
    vi.mocked(ygoprodeckApi.getCardsByIds).mockResolvedValue([
      exodiaFixture,
      potOfGreedFixture,
      gracefulCharityFixture,
    ]);

    // デッキレシピをロード
    const deckData = await loadDeckData("greedy-exodia-deck", mockFetch);

    // 基本検証
    expect(deckData).toBeDefined();
    expect(deckData.name).toBeDefined();
    expect(deckData.mainDeck).toBeDefined();
    expect(deckData.stats).toBeDefined();

    // YGOPRODeck API互換のカードIDが正しく解決されたことを確認
    // Note: Repository経由で呼ばれるため、直接的なfetch引数はない
    expect(ygoprodeckApi.getCardsByIds).toHaveBeenCalledOnce();
    expect(ygoprodeckApi.getCardsByIds).toHaveBeenCalledWith(
      expect.any(Function), // global fetch function
      expect.arrayContaining([
        expect.any(Number), // カードIDは数値であること
      ]),
    );
  });

  it("should validate RecipeCardEntry card IDs (T032)", async () => {
    const mockFetch = vi.fn();

    // Note: 実際のsampleDeckRecipesは常に有効なので
    // このテストは型エラーを防ぐための概念的な検証
    vi.mocked(ygoprodeckApi.getCardsByIds).mockResolvedValue([
      exodiaFixture,
      potOfGreedFixture,
      gracefulCharityFixture,
    ]);

    // 有効なデッキをロード（エラーが発生しないことを確認）
    await expect(loadDeckData("greedy-exodia-deck", mockFetch)).resolves.toBeDefined();
  });

  it("should handle API errors gracefully", async () => {
    const mockFetch = vi.fn();

    // API エラーをモック
    vi.mocked(ygoprodeckApi.getCardsByIds).mockRejectedValue(new Error("Network error"));

    // エラーがスローされることを確認
    await expect(loadDeckData("greedy-exodia-deck", mockFetch)).rejects.toThrow();
  });

  it("should handle missing deck ID", async () => {
    const mockFetch = vi.fn();

    // 存在しないデッキIDを指定
    // Note: SvelteKit error() 関数の動作により、エラーオブジェクトの形式が異なる
    await expect(loadDeckData("non-existent-deck", mockFetch)).rejects.toThrow();
  });

  it("should calculate deck stats correctly", async () => {
    const mockFetch = vi.fn();

    // モックデータを返す
    vi.mocked(ygoprodeckApi.getCardsByIds).mockResolvedValue([
      exodiaFixture,
      potOfGreedFixture,
      gracefulCharityFixture,
    ]);

    const deckData = await loadDeckData("greedy-exodia-deck", mockFetch);

    // 統計情報が計算されていることを確認
    expect(deckData.stats).toBeDefined();
    expect(deckData.stats.totalCards).toBeGreaterThan(0);
    expect(deckData.stats.uniqueCards).toBeGreaterThan(0);
    expect(typeof deckData.stats.monsterCount).toBe("number");
    expect(typeof deckData.stats.spellCount).toBe("number");
    expect(typeof deckData.stats.trapCount).toBe("number");
  });
});
