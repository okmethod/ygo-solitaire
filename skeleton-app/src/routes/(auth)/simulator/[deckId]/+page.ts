import type { PageLoad } from "./$types";
import { loadDeck } from "$lib/application/utils/deckLoader";
import { gameFacade } from "$lib/application/GameFacade";

export const load: PageLoad = ({ params }) => {
  const { deckId } = params;

  // デッキデータを読み込む
  const { deckRecipe, deckData } = loadDeck(deckId);
  console.log(`[PageLoad] Initializing game with deck: ${deckRecipe.name}`);

  // ゲーム状態を初期化する（デッキシャッフルと初期手札ドローを含む）
  gameFacade.initializeGame(deckRecipe);
  console.log("[PageLoad] Initial state:", gameFacade.getGameState());

  return {
    deckId,
    deckName: deckData.name,
  };
};
