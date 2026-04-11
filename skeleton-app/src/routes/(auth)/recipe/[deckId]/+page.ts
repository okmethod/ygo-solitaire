import type { PageLoad } from "./$types";
import { gameFacade } from "$lib/application/GameFacade";
import { extractDisplayCardIds } from "$lib/application/decks/deckLoader";

export const load: PageLoad = ({ params }) => {
  const { deckId } = params;

  const deckData = gameFacade.setupDeck(deckId, true);
  const uniqueCardIds = extractDisplayCardIds(deckData);

  return { deckId, deckData, uniqueCardIds };
};
