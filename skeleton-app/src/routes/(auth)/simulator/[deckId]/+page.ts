import type { PageLoad } from "./$types";
import { loadDeck } from "$lib/application/utils/deckLoader";
import { gameFacade } from "$lib/application/GameFacade";

/**
 * New architecture page loader using GameFacade
 */
export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  // デッキデータを読み込む
  const { deckRecipe, deckData } = await loadDeck(deckId, fetch);

  console.log(`[PageLoad] Initializing game with deck: ${deckRecipe.name}`);

  // ゲームを初期化する（デッキシャッフルと初期手札ドローを含む）
  gameFacade.initializeGame(deckRecipe);

  console.log("[PageLoad] Initial state:", gameFacade.getGameState());

  return {
    deckId,
    deckName: deckData.name,
  };
};
