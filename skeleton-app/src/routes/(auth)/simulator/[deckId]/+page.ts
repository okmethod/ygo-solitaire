import type { PageLoad } from "./$types";
import { gameFacade } from "$lib/application/GameFacade";
import { extractDisplayCardIds } from "$lib/application/decks/deckLoader";

export const load: PageLoad = ({ params, url }) => {
  const { deckId } = params;
  const isRestore = url.searchParams.get("restore") === "true";

  // 復元モードの場合はカードデータのみ準備し、ゲーム状態はリセットしない
  const deckData = isRestore ? gameFacade.setupDeck(deckId) : gameFacade.newGame(deckId);
  const uniqueCardIds = extractDisplayCardIds(deckData, true);

  return { deckId, deckData, uniqueCardIds, isRestore };
};
