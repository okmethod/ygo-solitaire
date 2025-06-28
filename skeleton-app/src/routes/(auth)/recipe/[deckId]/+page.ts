import type { PageLoad } from "./$types";
import { loadDeckData } from "$lib/api/deckLoader";

export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  const recipe = await loadDeckData(deckId, fetch);

  return {
    recipe,
    deckId,
  };
};
