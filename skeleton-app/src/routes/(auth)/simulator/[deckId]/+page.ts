import type { PageLoad } from "./$types";
import { loadDeckData } from "$lib/utils/deckLoader";
import { DuelState } from "$lib/classes/DuelState";

export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  const deckData = await loadDeckData(deckId, fetch);
  const duelState = DuelState.loadDeck(deckData);

  // 初期手札をドロー
  duelState.drawInitialHands();

  return {
    duelState,
  };
};
