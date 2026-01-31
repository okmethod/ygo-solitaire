/**
 * YGOPRODeck API unit tests
 *
 * Tests for cache hit/miss behavior and API integration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCardsByIds, clearCache } from "$lib/infrastructure/api/ygoprodeck";
import type { YGOProDeckCardInfo } from "$lib/application/ports/ICardDataRepository";

// モックフィクスチャ（実際のYGOPRODeck APIレスポンス形式）
const mockExodia: YGOProDeckCardInfo = {
  id: 33396948,
  name: "Exodia the Forbidden One",
  type: "Effect Monster",
  humanReadableCardType: "Effect Monster",
  frameType: "effect",
  desc: 'If you have "Right Leg of the Forbidden One", "Left Leg of the Forbidden One", "Right Arm of the Forbidden One" and "Left Arm of the Forbidden One" in addition to this card in your hand, you win the Duel.',
  atk: 1000,
  def: 1000,
  level: 3,
  race: "Spellcaster",
  attribute: "DARK",
  ygoprodeck_url: "https://ygoprodeck.com/card/exodia-the-forbidden-one-4545",
  card_images: [
    {
      id: 33396948,
      image_url: "https://images.ygoprodeck.com/images/cards/33396948.jpg",
      image_url_small: "https://images.ygoprodeck.com/images/cards_small/33396948.jpg",
      image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/33396948.jpg",
    },
  ],
};

const mockPotOfGreed: YGOProDeckCardInfo = {
  id: 55144522,
  name: "Pot of Greed",
  type: "Spell Card",
  humanReadableCardType: "Normal Spell",
  frameType: "spell",
  desc: "Draw 2 cards.",
  race: "Normal",
  ygoprodeck_url: "https://ygoprodeck.com/card/pot-of-greed-5645",
  card_images: [
    {
      id: 55144522,
      image_url: "https://images.ygoprodeck.com/images/cards/55144522.jpg",
      image_url_small: "https://images.ygoprodeck.com/images/cards_small/55144522.jpg",
      image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/55144522.jpg",
    },
  ],
};

describe("getCardsByIds - with mock", () => {
  beforeEach(() => {
    clearCache(); // テスト前にキャッシュクリア
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch cards from mocked API", async () => {
    // fetchのモック
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockExodia] }),
    });

    const cards = await getCardsByIds(mockFetch, [33396948]);

    expect(cards).toHaveLength(1);
    expect(cards[0].name).toBe("Exodia the Forbidden One");
    expect(cards[0].id).toBe(33396948);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should use cache for duplicate requests", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockExodia] }),
    });

    // 1回目のリクエスト（キャッシュミス）
    const firstCall = await getCardsByIds(mockFetch, [33396948]);
    expect(firstCall).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 2回目のリクエスト（キャッシュヒット）
    const secondCall = await getCardsByIds(mockFetch, [33396948]);
    expect(secondCall).toHaveLength(1);
    expect(secondCall[0].name).toBe("Exodia the Forbidden One");

    // APIリクエストは1回のみ（キャッシュヒット）
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle mixed cache hits and misses", async () => {
    // 1回目: Exodiaのみ取得
    const mockFetch1 = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockExodia] }),
    });

    await getCardsByIds(mockFetch1, [33396948]);
    expect(mockFetch1).toHaveBeenCalledTimes(1);

    // 2回目: Exodia（キャッシュヒット）+ Pot of Greed（キャッシュミス）
    const mockFetch2 = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockPotOfGreed] }),
    });

    const cards = await getCardsByIds(mockFetch2, [33396948, 55144522]);

    expect(cards).toHaveLength(2);
    expect(cards.find((c) => c.id === 33396948)?.name).toBe("Exodia the Forbidden One");
    expect(cards.find((c) => c.id === 55144522)?.name).toBe("Pot of Greed");

    // Pot of Greedのみリクエスト（Exodiaはキャッシュヒット）
    expect(mockFetch2).toHaveBeenCalledTimes(1);
    expect(mockFetch2).toHaveBeenCalledWith(expect.stringContaining("id=55144522"), expect.any(Object));
  });

  it("should return empty array for empty input", async () => {
    const mockFetch = vi.fn();
    const cards = await getCardsByIds(mockFetch, []);

    expect(cards).toHaveLength(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    const cards = await getCardsByIds(mockFetch, [99999999]);

    expect(cards).toHaveLength(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("clearCache - test utility", () => {
  it("should clear the cache", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockExodia] }),
    });

    // 1回目のリクエスト
    await getCardsByIds(mockFetch, [33396948]);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // キャッシュクリア
    clearCache();

    // 2回目のリクエスト（キャッシュクリア後なので再度APIリクエスト）
    await getCardsByIds(mockFetch, [33396948]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe("Card ID Resolution Integration Test", () => {
  beforeEach(() => {
    clearCache();
  });

  it("should resolve YGOPRODeck API compatible numeric card IDs", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockExodia, mockPotOfGreed] }),
    });

    // YGOPRODeck API互換の数値IDで解決
    const cardIds = [33396948, 55144522]; // Exodia, Pot of Greed
    const cards = await getCardsByIds(mockFetch, cardIds);

    // 解決されたカードデータを検証
    expect(cards).toHaveLength(2);
    expect(cards[0].id).toBe(33396948);
    expect(cards[0].name).toBe("Exodia the Forbidden One");
    expect(cards[1].id).toBe(55144522);
    expect(cards[1].name).toBe("Pot of Greed");

    // APIリクエストが正しいIDで呼ばれたことを確認
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("id=33396948,55144522"), expect.any(Object));
  });

  it("should handle batch card ID resolution", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockExodia, mockPotOfGreed] }),
    });

    // 複数カードIDのバッチリクエスト
    const cardIds = [33396948, 55144522];
    const cards = await getCardsByIds(mockFetch, cardIds);

    expect(cards).toHaveLength(2);

    // バッチリクエスト（1回のAPIコール）
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // URLにカンマ区切りIDが含まれることを確認
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain("33396948");
    expect(callUrl).toContain("55144522");
  });

  it("should return correct card types from API response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockExodia, mockPotOfGreed] }),
    });

    const cards = await getCardsByIds(mockFetch, [33396948, 55144522]);

    // Exodia (モンスター)
    const exodia = cards.find((c) => c.id === 33396948);
    expect(exodia).toBeDefined();
    expect(exodia?.type).toBe("Effect Monster");
    expect(exodia?.frameType).toBe("effect");

    // Pot of Greed (魔法)
    const potOfGreed = cards.find((c) => c.id === 55144522);
    expect(potOfGreed).toBeDefined();
    expect(potOfGreed?.type).toBe("Spell Card");
    expect(potOfGreed?.frameType).toBe("spell");
  });
});
