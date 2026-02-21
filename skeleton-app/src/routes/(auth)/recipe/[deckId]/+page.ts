import type { PageLoad } from "./$types";
import { loadDeck } from "$lib/application/deck/deckLoader";

export const load: PageLoad = ({ params }) => {
  const { deckId } = params;

  // デッキデータを読み込む
  const { deckData, uniqueCardIds } = loadDeck(deckId);

  return {
    deckId,
    deckData,
    uniqueCardIds,
  };
};
