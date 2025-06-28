import type { PageLoad } from "./$types";
import { loadDeckData } from "$lib/api/deckLoader";

export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  const deck = await loadDeckData(deckId, fetch);

  // ゲーム初期状態を作成
  const gameState = {
    playerLifePoints: 8000,
    opponentLifePoints: 8000,
    currentTurn: 1,
    currentPhase: "メインフェーズ1",
    gameStatus: "準備中" as const,
    handCards: 5,
    deckCards: deck.mainDeck.length,
    extraDeckCards: deck.extraDeck.length,
    graveyardCards: 0,
  };

  return {
    deck,
    gameState,
    deckId,
  };
};
