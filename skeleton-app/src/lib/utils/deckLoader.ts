import { error } from "@sveltejs/kit";
import type { RecipeCardEntry, LoadedCardEntry, DeckData, DeckStats, MainDeckData } from "$lib/types/deck";
import { convertYGOProDeckCardToCardData, type YGOProDeckCard } from "$lib/types/ygoprodeck";
import { getCardsByIds } from "$lib/api/ygoprodeck";
import { sampleDeckRecipes } from "$lib/data/sampleDeckRecipes";

// デッキエントリーからカードタイプ別に分類したMainDeckDataを作成する内部関数
function buildMainDeckData(ygoCardMap: Map<number, YGOProDeckCard>, entries: RecipeCardEntry[]): MainDeckData {
  const monsters: LoadedCardEntry[] = [];
  const spells: LoadedCardEntry[] = [];
  const traps: LoadedCardEntry[] = [];

  for (const entry of entries) {
    const ygoCard = ygoCardMap.get(entry.id);
    if (ygoCard) {
      const cardData = convertYGOProDeckCardToCardData(ygoCard);
      const loadedEntry: LoadedCardEntry = {
        cardData: cardData,
        quantity: entry.quantity,
      };

      // カードタイプ別に分類
      switch (cardData.type) {
        case "monster":
          monsters.push(loadedEntry);
          break;
        case "spell":
          spells.push(loadedEntry);
          break;
        case "trap":
          traps.push(loadedEntry);
          break;
      }
    }
  }

  return { monsters, spells, traps };
}

// エクストラデッキ用の従来関数（分類不要）
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

// デッキ統計情報を計算する内部関数（新しい構造対応）
function calculateDeckStats(mainDeck: MainDeckData, extraDeck: LoadedCardEntry[]): DeckStats {
  // 各カードタイプの枚数を直接計算（フィルタリング不要）
  const monsterCount = mainDeck.monsters.reduce((sum, entry) => sum + entry.quantity, 0);
  const spellCount = mainDeck.spells.reduce((sum, entry) => sum + entry.quantity, 0);
  const trapCount = mainDeck.traps.reduce((sum, entry) => sum + entry.quantity, 0);

  const extraCount = extraDeck.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalCards = monsterCount + spellCount + trapCount + extraCount;

  const uniqueCards = mainDeck.monsters.length + mainDeck.spells.length + mainDeck.traps.length + extraDeck.length;

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

  // メインデッキをカードタイプ別に分類
  const mainDeckData = buildMainDeckData(ygoCardMap, recipe.mainDeck);

  // エクストラデッキは従来通り
  const extraDeckCards = buildLoadedCardEntries(ygoCardMap, recipe.extraDeck);

  // 統計情報を計算
  const stats = calculateDeckStats(mainDeckData, extraDeckCards);

  const deckData: DeckData = {
    name: recipe.name,
    description: recipe.description,
    category: recipe.category,
    mainDeck: mainDeckData,
    extraDeck: extraDeckCards,
    stats,
  };

  return deckData;
}
