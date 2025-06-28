import { error } from "@sveltejs/kit";
import type { Card } from "$lib/types/card";
import type { DeckCardEntry, DeckData } from "$lib/types/deck";
import { convertYGOProDeckCardToCard, type YGOProDeckCard } from "$lib/types/ygoprodeck";
import { getCardsByIds } from "$lib/api/ygoprodeck";
import { sampleDeckRecipes } from "$lib/data/sampleDeckRecipes";

// デッキエントリーからCard配列を作成する内部関数
function buildCardArray(ygoCardMap: Map<number, YGOProDeckCard>, entries: DeckCardEntry[]): Card[] {
  const cards: Card[] = [];
  for (const entry of entries) {
    const ygoCard = ygoCardMap.get(entry.id);
    if (ygoCard) {
      const card = convertYGOProDeckCardToCard(ygoCard, entry.quantity);
      // quantity分だけカードを追加
      for (let i = 0; i < entry.quantity; i++) {
        cards.push(card);
      }
    }
  }
  return cards;
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
  const mainDeckCards = buildCardArray(ygoCardMap, recipe.mainDeck);
  const extraDeckCards = buildCardArray(ygoCardMap, recipe.extraDeck);

  const deckData: DeckData = {
    name: recipe.name,
    description: recipe.description,
    category: recipe.category,
    mainDeck: mainDeckCards,
    extraDeck: extraDeckCards,
  };

  return deckData;
}
