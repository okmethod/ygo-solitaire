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

  // ゲームを初期化する
  gameFacade.initializeGame(deckRecipe);

  // Shuffle deck before drawing initial hand
  const shuffleResult = gameFacade.shuffleDeck();
  if (!shuffleResult.success) {
    console.error("[PageLoad] Failed to shuffle deck:", shuffleResult.error);
  }

  // Draw initial hand (5 cards)
  const drawResult = gameFacade.drawCard(5);
  if (!drawResult.success) {
    console.error("[PageLoad] Failed to draw initial hand:", drawResult.error);
  }

  console.log("[PageLoad] Initial state:", gameFacade.getGameState());

  return {
    deckId,
    deckName: deckData.name,
  };
};
