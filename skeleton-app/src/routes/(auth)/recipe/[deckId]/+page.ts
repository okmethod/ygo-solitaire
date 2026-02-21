import type { PageLoad } from "./$types";
import { gameFacade } from "$lib/application/GameFacade";

export const load: PageLoad = ({ params }) => {
  const { deckId } = params;

  const { deckData, uniqueCardIds } = gameFacade.loadDeck(deckId);

  return { deckId, deckData, uniqueCardIds };
};
