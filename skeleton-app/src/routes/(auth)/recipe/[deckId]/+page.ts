import type { PageLoad } from "./$types";
import { loadDeckData } from "$lib/shared/utils/deckLoader";

export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  const deckData = await loadDeckData(deckId, fetch);

  return {
    deckId,
    deckData,
  };
};
