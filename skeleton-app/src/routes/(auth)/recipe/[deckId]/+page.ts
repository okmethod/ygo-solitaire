import type { PageLoad } from "./$types";
import { loadDeck } from "$lib/application/utils/deckLoader";

export const load: PageLoad = ({ params }) => {
  const { deckId } = params;

  // デッキデータを読み込む
  const { deckData } = loadDeck(deckId);

  return {
    deckId,
    deckData,
  };
};
