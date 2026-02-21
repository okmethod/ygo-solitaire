import type { PageLoad } from "./$types";
import { getDeckRecipe, extractUniqueCardIds, buildDeckData } from "$lib/application/decks/deckLoader";
import { registerCardDataByIds } from "$lib/domain/cards";

export const load: PageLoad = ({ params }) => {
  const { deckId } = params;

  const deckRecipe = getDeckRecipe(deckId);
  const uniqueCardIds = extractUniqueCardIds(deckRecipe);

  registerCardDataByIds(uniqueCardIds);

  const deckData = buildDeckData(deckRecipe, uniqueCardIds);

  return {
    deckId,
    deckData,
    uniqueCardIds,
  };
};
