import type { PageLoad } from "./$types";
import { gameFacade } from "$lib/application/GameFacade";

export const load: PageLoad = ({ params, url }) => {
  const { deckId } = params;
  const isRestore = url.searchParams.get("restore") === "true";

  // 復元モードの場合はカードデータのみ準備し、ゲーム状態はリセットしない
  const { deckData, uniqueCardIds } = isRestore ? gameFacade.prepareDeck(deckId) : gameFacade.initializeGame(deckId);

  return { deckId, deckData, uniqueCardIds, isRestore };
};
