import type { PageLoad } from "./$types";
import { loadDeckData } from "$lib/utils/deckLoader";
import { DuelState } from "$lib/classes/DuelState";
import { DeckRecipe } from "$lib/classes/DeckRecipe";

export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  const deckData = await loadDeckData(deckId, fetch);
  const deck = new DeckRecipe(deckData);

  // DuelStateクラスを使用してゲーム初期状態を作成
  const duelState = DuelState.loadRecipe(deck);

  // 初期手札をドロー
  duelState.drawInitialHands();

  return {
    deck,
    duelState,
    deckId,
  };
};
