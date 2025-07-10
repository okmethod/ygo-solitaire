import type { PageLoad } from "./$types";
import { loadDeckData } from "$lib/utils/deckLoader";
import { DuelState } from "$lib/classes/DuelState";
import { sampleDeckRecipes } from "$lib/data/sampleDeckRecipes";

export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  const deckData = await loadDeckData(deckId, fetch);
  const duelState = DuelState.loadDeck(deckData);

  // 対応するデッキレシピから効果を登録
  const deckRecipe = sampleDeckRecipes[deckId];
  if (deckRecipe) {
    console.log(`[PageLoad] デッキレシピ「${deckRecipe.name}」から効果を登録します`);
    duelState.registerEffectsFromDeckRecipe(deckRecipe);
  } else {
    console.warn(`[PageLoad] デッキID「${deckId}」に対応するレシピが見つかりません`);
  }

  // デッキをシャッフルして初期手札をドロー
  duelState.shuffleMainDeck();
  duelState.drawInitialHands();

  console.log(`[PageLoad] 初期手札: ${duelState.hands.length}枚`);
  console.log(`[PageLoad] 手札カード:`, duelState.hands.map(card => `${card.name}(${card.id})`));

  return {
    duelState,
  };
};
