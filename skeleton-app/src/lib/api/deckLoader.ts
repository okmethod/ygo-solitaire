import { error } from "@sveltejs/kit";
import type { Card } from "$lib/types/card";
import type { DeckRecipe } from "$lib/types/recipe";
import { convertYGOProDeckCardToCard } from "$lib/types/ygoprodeck";
import { getCardsByIds } from "$lib/api/ygoprodeck";
import { sampleDeckRecipes } from "$lib/data/sampleDeckRecipes";

/**
 * デッキIDからデッキデータを取得する共通処理
 */
export async function loadDeckData(deckId: string, fetch: typeof window.fetch): Promise<DeckRecipe> {
  const recipeData = sampleDeckRecipes[deckId];

  if (!recipeData) {
    throw error(404, "デッキが見つかりません");
  }

  try {
    // メインデッキとエクストラデッキの全カード ID を取得
    const allCardEntries = [...recipeData.mainDeck, ...recipeData.extraDeck];
    const uniqueCardIds = Array.from(new Set(allCardEntries.map((entry) => entry.id)));

    // API からカード情報を取得
    const apiCards = await getCardsByIds(fetch, uniqueCardIds);

    // カード情報をマップに変換
    const cardMap = new Map(apiCards.map((card) => [card.id, card]));

    // メインデッキのカード配列を作成
    const mainDeckCards: Card[] = [];
    for (const entry of recipeData.mainDeck) {
      const apiCard = cardMap.get(entry.id);
      if (apiCard) {
        const card = convertYGOProDeckCardToCard(apiCard, entry.quantity);
        // quantity分だけカードを追加
        for (let i = 0; i < entry.quantity; i++) {
          mainDeckCards.push(card);
        }
      }
    }

    // エクストラデッキのカード配列を作成
    const extraDeckCards: Card[] = [];
    for (const entry of recipeData.extraDeck) {
      const apiCard = cardMap.get(entry.id);
      if (apiCard) {
        const card = convertYGOProDeckCardToCard(apiCard, entry.quantity);
        // quantity分だけカードを追加
        for (let i = 0; i < entry.quantity; i++) {
          extraDeckCards.push(card);
        }
      }
    }

    // DeckRecipe形式に変換
    const deck: DeckRecipe = {
      name: recipeData.name,
      description: recipeData.description,
      category: recipeData.category,
      mainDeck: mainDeckCards,
      extraDeck: extraDeckCards,
    };

    return deck;
  } catch (err) {
    console.error("デッキ情報の取得に失敗しました:", err);
    throw error(500, "デッキ情報の取得に失敗しました");
  }
}
