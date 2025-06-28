import { error } from "@sveltejs/kit";
import type { RecipeCardEntry, LoadedCardEntry, DeckData, DeckStats } from "$lib/types/deck";
import { convertYGOProDeckCardToCardData, type YGOProDeckCard } from "$lib/types/ygoprodeck";
import { getCardsByIds } from "$lib/api/ygoprodeck";
import { sampleDeckRecipes } from "$lib/data/sampleDeckRecipes";

// デッキエントリーからLoadedCardEntry配列を作成する内部関数
function buildLoadedCardEntries(
  ygoCardMap: Map<number, YGOProDeckCard>,
  entries: RecipeCardEntry[],
): LoadedCardEntry[] {
  const loadedCards: LoadedCardEntry[] = [];
  for (const entry of entries) {
    const ygoCard = ygoCardMap.get(entry.id);
    if (ygoCard) {
      const cardData = convertYGOProDeckCardToCardData(ygoCard);
      loadedCards.push({
        cardData: cardData,
        quantity: entry.quantity,
      });
    }
  }
  return loadedCards;
}

// デッキ統計情報を計算する内部関数
function calculateDeckStats(mainDeck: LoadedCardEntry[], extraDeck: LoadedCardEntry[]): DeckStats {
  const allCards = [...mainDeck, ...extraDeck];

  const totalCards = allCards.reduce((sum, entry) => sum + entry.quantity, 0);
  const uniqueCards = allCards.length;

  const monsterCount = mainDeck
    .filter((entry) => entry.cardData.type === "monster")
    .reduce((sum, entry) => sum + entry.quantity, 0);

  const spellCount = mainDeck
    .filter((entry) => entry.cardData.type === "spell")
    .reduce((sum, entry) => sum + entry.quantity, 0);

  const trapCount = mainDeck
    .filter((entry) => entry.cardData.type === "trap")
    .reduce((sum, entry) => sum + entry.quantity, 0);

  return {
    totalCards,
    uniqueCards,
    monsterCount,
    spellCount,
    trapCount,
  };
}

/**
 * デッキレシピからデッキデータを生成する
 */
export async function loadDeckData(deckId: string, fetch: typeof window.fetch): Promise<DeckData> {
  const recipe = sampleDeckRecipes[deckId];
  if (!recipe) {
    throw error(404, "デッキが見つかりません");
  }

  // メインデッキとエクストラデッキの全カード ID を取得
  const allCardEntries = [...recipe.mainDeck, ...recipe.extraDeck];
  const uniqueCardIds = Array.from(new Set(allCardEntries.map((entry) => entry.id)));

  // API でカード情報を取得
  let ygoCards: YGOProDeckCard[];
  try {
    ygoCards = await getCardsByIds(fetch, uniqueCardIds);
  } catch (err) {
    console.error("カード情報のAPI取得に失敗しました:", err);
    throw error(500, "カード情報の取得に失敗しました");
  }

  // カード情報をマップに変換
  const ygoCardMap = new Map(ygoCards.map((card) => [card.id, card]));

  // メインデッキとエクストラデッキのカード配列を作成
  const mainDeckCards = buildLoadedCardEntries(ygoCardMap, recipe.mainDeck);
  const extraDeckCards = buildLoadedCardEntries(ygoCardMap, recipe.extraDeck);

  // 統計情報を計算
  const stats = calculateDeckStats(mainDeckCards, extraDeckCards);

  const deckData: DeckData = {
    name: recipe.name,
    description: recipe.description,
    category: recipe.category,
    mainDeck: mainDeckCards,
    extraDeck: extraDeckCards,
    stats,
  };

  return deckData;
}
