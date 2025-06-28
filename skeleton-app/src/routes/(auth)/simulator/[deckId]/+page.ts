import type { PageLoad } from "./$types";
import { loadDeckData } from "$lib/utils/deckLoader";
import { DuelState } from "$lib/classes/DuelState";
import { Deck } from "$lib/classes/Deck";

export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  const recipe = await loadDeckData(deckId, fetch);
  const deck = new Deck(recipe);

  // DuelStateクラスを使用してゲーム初期状態を作成
  const duelState = DuelState.loadDeck(deck);

  // 初期手札をドロー
  duelState.drawInitialHands();

  return {
    deck,
    duelState,
    deckId,
  };
};
