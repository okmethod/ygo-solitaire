import type { PageLoad } from "./$types";
import { loadDeck } from "$lib/application/utils/deckLoader";

export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  const { deckData } = await loadDeck(deckId, fetch);

  return {
    deckId,
    deckData,
  };
};
